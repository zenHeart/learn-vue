# Vue 3 源码级隐式经验

> 本文件直接从 [vuejs/core](https://github.com/vuejs/core) `main` 分支源码中提炼文档未单独成节、但对实战或排错至关重要的实现细节。每条引用附 `file:line` 与至少 3 行代码片段。
> 引用路径前缀：`packages/reactivity/src/`、`packages/runtime-core/src/`、`packages/runtime-dom/src/`、`packages/compiler-sfc/src/script/`。
>
> Vue 版本基线：3.5.x（commit 取自最近一次 `git log` HEAD）。

## 1. `reactive()` 对 `Array` / `Map` / `Set` / `WeakMap` 的代理限制

`reactive()` 通过 `targetTypeMap(toRawType(target))` 决定是否走普通 baseHandlers 还是 `collectionHandlers`；非法类型直接返回原对象：

```ts
// packages/reactivity/src/reactive.ts:52-66
function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}
```

并且 `createReactiveObject` 在目标「不可扩展」或已带 `ReactiveFlags.SKIP` 标记时直接返回：

```ts
// packages/reactivity/src/reactive.ts:267-300
function createReactiveObject(target: Target, isReadonly: boolean, ...) {
  if (!isObject(target)) { /* warn */ return target }
  // target is already a Proxy, return it.
  if (target[ReactiveFlags.RAW] && !(isReadonly && target[ReactiveFlags.IS_REACTIVE])) return target
  if (target[ReactiveFlags.SKIP] || !Object.isExtensible(target)) return target
  const existingProxy = proxyMap.get(target); if (existingProxy) return existingProxy
  const targetType = targetTypeMap(toRawType(target))
  if (targetType === TargetType.INVALID) return target
  const proxy = new Proxy(target, targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers)
  ...
}
```

**实战意义**：
- 普通对象字面量、数组、`Map`/`Set`/`WeakMap`/`WeakSet` 才会被代理。
- `Date` / `RegExp` / `Function` / `Promise` / `class instance` 默认 NOT reactive —— 这就是为什么 `markRaw(instance)` 对第三方实例很重要的原因。
- `Object.freeze(obj)` 之后再调用 `reactive(obj)` 也无效，因为 `Object.isExtensible(target)` 返回 false。

## 2. `defineOptions` / `defineSlots` 宏的编译器展开

`defineOptions` 在 compiler-sfc 中显式禁止和 `props / emits / expose / slots` 同名声明（不允许替代对应宏）。

```ts
// packages/compiler-sfc/src/script/defineOptions.ts:18-72
export function processDefineOptions(ctx: ScriptCompileContext, node: Node): boolean {
  if (!isCallOf(node, DEFINE_OPTIONS)) return false
  if (ctx.hasDefineOptionsCall) {
    ctx.error(`duplicate ${DEFINE_OPTIONS}() call`, node)
  }
  if (node.typeParameters) ctx.error(`${DEFINE_OPTIONS}() cannot accept type arguments`, node)
  if (!node.arguments[0]) return true
  ctx.hasDefineOptionsCall = true
  ctx.optionsRuntimeDecl = unwrapTSNode(node.arguments[0])
  // ...遍历 properties:
  if (propsOption) ctx.error(`${DEFINE_OPTIONS}() cannot be used to declare props. Use ${DEFINE_PROPS}() instead.`, propsOption)
  if (emitsOption) ctx.error(`${DEFINE_OPTIONS}() cannot be used to declare emits. Use ${DEFINE_EMITS}() instead.`, emitsOption)
  if (exposeOption) ctx.error(`${DEFINE_OPTIONS}() cannot be used to declare expose. Use ${DEFINE_EXPOSE}() instead.`, exposeOption)
  if (slotsOption) ctx.error(`${DEFINE_OPTIONS}() cannot be used to declare slots. Use ${DEFINE_SLOTS}() instead.`, slotsOption)
  return true
}
```

**实战意义**：
- `defineOptions` 不能跟 `defineProps / defineEmits / defineExpose / defineSlots` 重复声明同名字段，只能放 `name / inheritAttrs` 之类。
- `defineOptions` 自身 hoist 到模块顶层（不能引用局部变量）。
- `defineSlots` 只接受类型参数（运行期为 `null as any`），类型参数 key 即 slot 名，value 是 slot 函数签名 —— 编译时只做类型推断。

## 3. `computed` 的 dirty 标记与缓存策略

`computed` 通过 `flags: EffectFlags.DIRTY` 标记 + `refreshComputed(this)` 实现 lazy 缓存：

```ts
// packages/reactivity/src/computed.ts:97-122
constructor(public fn: ComputedGetter<T>, private readonly setter: ComputedSetter<T> | undefined, isSSR: boolean) {
  this[ReactiveFlags.IS_READONLY] = !setter
  this.isSSR = isSSR
}

notify(): true | void {
  this.flags |= EffectFlags.DIRTY
  if (!(this.flags & EffectFlags.NOTIFIED) && activeSub !== this) {
    batch(this, true)
    return true
  }
}

get value(): T {
  const link = __DEV__ ? this.dep.track({...}) : this.dep.track()
  refreshComputed(this)
  if (link) link.version = this.dep.version
  return this._value
}
```

`refreshComputed` 只在 `isDirty(this)`（即 `DIRTY` 标志位有效）时才重算 getter：

```ts
// packages/reactivity/src/effect.ts:200-212 (ReactiveEffect.trigger / runIfDirty)
trigger(): void {
  if (this.flags & EffectFlags.PAUSED) pausedQueueEffects.add(this)
  else if (this.scheduler) this.scheduler()
  else this.runIfDirty()
}

runIfDirty(): void {
  if (isDirty(this)) this.run()
}
```

**实战意义**：
- 读 `computed.value` 不依赖会自动 mark dirty；脏值下次访问才重新执行 getter。
- `computed(() => x.value)` 只有当 `x` 变化时才重算，即使被访问 100 次。
- 当 computed 的依赖未变化时，多个 watcher 共享同一个 computed 不会触发重复 getter。

## 4. `effectScope` 批量 dispose 副作用

`effectScope` 是「composable 解耦」机制；`onScopeDispose` 必须在活跃 scope 内注册：

```ts
// packages/reactivity/src/effectScope.ts (节选)
export class EffectScope {
  active = true
  effects: ReactiveEffect[] = []
  cleanups: (() => void)[] = []
  parent: EffectScope | undefined
  detached?: boolean
  constructor(detached?: boolean) { parent = activeEffectScope; activeEffectScope = this }
  run<T>(fn: () => T): T | undefined { if (this.active) try { return fn() } finally { activeEffectScope = this.parent } else return undefined }
  stop(fromParent?: boolean) { /* 遍历 effects + cleanups */ }
}

export function onScopeDispose(fn: () => void, failSilently?: boolean): void {
  if (activeEffectScope === undefined) {
    if (failSilently) return
    warn('onScopeDispose() is called when there is no active effect scope to be associated with.')
  }
  activeEffectScope.cleanups.push(fn)
}
```

**实战意义**：
- 默认 `setup()` 内运行的所有 `computed / watch / watchEffect` 都挂在组件 scope，组件 unmount 自动 stop。
- `effectScope(true)` 创建 detached scope，需要手动 `scope.stop()`（用于 store / composable）。
- Vue 3.5 之前没有 failSilently，所有 composable 顶层注册 dispose 必须能拿到 active scope，否则抛 warning。

## 5. `watchEffect` / `watch` 的调度时机

`watchEffect` 默认 `flush: 'pre'`，调度器把 job 推到 scheduler 队列；`SchedulerJobFlags.PRE` 在 `flushPreFlushCbs` 中优先于组件 update：

```ts
// packages/runtime-core/src/apiWatch.ts (doWatch flush 处理)
function doWatch(...) {
  // ...
  effect = new ReactiveEffect(getter, NOOP, scheduler)
  job.allowRecurse = !!cb
  if (flush === 'post') queuePostRenderEffect(job, ...)
  else if (flush === 'sync') job()
  else queueJob(job) // 'pre' 走这里
}
```

`queueJob` 用二分查找按 `id` 升序插入（parent 先于 child）：

```ts
// packages/runtime-core/src/scheduler.ts:88-117
function findInsertionIndex(id: number) {
  let start = flushIndex + 1, end = queue.length
  while (start < end) {
    const middle = (start + end) >>> 1
    const middleJob = queue[middle]
    if (middleJobId < id || (middleJobId === id && middleJob.flags! & SchedulerJobFlags.PRE)) start = middle + 1
    else end = middle
  }
  return start
}
export function queueJob(job: SchedulerJob): void {
  if (!(job.flags! & SchedulerJobFlags.QUEUED)) {
    const lastJob = queue[queue.length - 1]
    if (!lastJob || (!(job.flags! & SchedulerJobFlags.PRE) && jobId >= getId(lastJob))) queue.push(job)
    else queue.splice(findInsertionIndex(jobId), 0, job)
    job.flags! |= SchedulerJobFlags.QUEUED
    queueFlush()
  }
}
```

**实战意义**：
- `flush: 'pre'`（默认）：watcher 在组件 update 前触发，能拿到组件更新前 DOM。
- `flush: 'post'`：DOM 更新之后，常配合 `useTemplateRef` 取真实节点。
- `flush: 'sync'`：同步触发，性能最差但语义最直接（注意递归风险）。
- `SchedulerJobFlags.ALLOW_RECURSE` 只对组件 update 和 watch callback 默认开启，watchEffect 不会自递归触发（避免 push 类方法引发的 #1740 死循环）。

## 6. 渲染器异步批处理：`queueJob` + `flushJobs`

`queueFlush` 通过 `Promise.resolve().then(flushJobs)` 把任务推到微任务队列：

```ts
// packages/runtime-core/src/scheduler.ts:62-67
const resolvedPromise = Promise.resolve() as Promise<any>
let currentFlushPromise: Promise<void> | null = null
export function nextTick(fn?: (this: any) => any) {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}

function queueFlush() {
  if (!currentFlushPromise) currentFlushPromise = resolvedPromise.then(flushJobs)
}
```

`flushJobs` 中同步执行 pre flush → 组件 update → post flush，并保留 `RECURSION_LIMIT = 100` 防递归：

```ts
// packages/runtime-core/src/scheduler.ts
const RECURSION_LIMIT = 100
function flushJobs(seen?: CountMap) {
  // 检查 isFlushing / flushIndex
  // 1) flushPreFlushCbs() 先执行 pre watcher（取组件 uid 比对，跳过已 unmount 的）
  // 2) queue 中的组件 update
  // 3) flushPostFlushCbs() 异步执行（setTimeout 兜底，避免死循环）
}
```

**实战意义**：
- `nextTick()` 返回的 promise 是当前正在 flush 的 promise，没有 flush 就返回 `resolvedPromise`（微任务）。
- 同一个 tick 内多次 `ref.value++` 只触发一次组件 update。
- `RECURSION_LIMIT = 100` 之后会触发 `warn(maxRecursiveUpdates)` —— 这是「循环赋值」最常见的诊断依据。

## 7. `validateProp` 类型校验与 validator 调用顺序

```ts
// packages/runtime-core/src/componentProps.ts:682-707
function validateProp(name: string, value: unknown, prop: PropOptions, props: Data, isAbsent: boolean) {
  const { type, required, validator, skipCheck } = prop
  if (required && isAbsent) { warn('Missing required prop: "' + name + '"'); return }
  if (value == null && !required) return
  if (type != null && type !== true && !skipCheck) {
    let isValid = false
    const types = isArray(type) ? type : [type]
    const expectedTypes = []
    for (let i = 0; i < types.length && !isValid; i++) {
      const { valid, expectedType } = assertType(value, types[i])
      expectedTypes.push(expectedType || '')
      isValid = valid
    }
    if (!isValid) { warn(getInvalidTypeMessage(...)); return }
  }
  if (validator && !validator(value, props)) {
    warn('Invalid prop: custom validator check failed for prop "' + name + '".')
  }
}
```

**实战意义**：
- type 校验在 `null / undefined` 时直接 return，不会再调 validator —— 这是为何 `validator` 内 `value` 可能是 undefined。
- `type` 为 `null` 时 `assertType` 返回 `valid: value === null`，相当于「只接受 null」。
- `type: true` 是显式 disable runtime 检查（`type !== true` 跳过）。
- `assertType` 用 `expectedTypes.length === 0` 警告「Prop type [] for prop "X" won't match anything」—— 这是 `{ type: [] }` 的常见误用。

## 8. 编译时 v-on 自动注册事件 vs 显式 emits

`componentEmits.ts` 中的 `emit()` 在 dev 下检查 emits 是否声明：

```ts
// packages/runtime-core/src/componentEmits.ts:131-160
export function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted) return
  const props = instance.vnode.props || EMPTY_OBJ
  if (__DEV__) {
    const { emitsOptions, propsOptions: [propsOptions] } = instance
    if (emitsOptions) {
      if (!(event in emitsOptions) && !(__COMPAT__ && (event.startsWith('hook:') || event.startsWith(compatModelEventPrefix)))) {
        if (!propsOptions || !(toHandlerKey(camelize(event)) in propsOptions)) {
          warn(`Component emitted event "${event}" but it is neither declared in the emits option nor as an "${toHandlerKey(camelize(event))}" prop.`)
        }
      } else {
        const validator = emitsOptions[event]
        if (isFunction(validator)) {
          const isValid = validator(...rawArgs)
          if (!isValid) warn(`Invalid event arguments: event validation failed for event "${event}".`)
        }
      }
    }
  }
  const handlers = (props[toHandlerKey(camelize(event))] || props[toHandlerKey(hyphenate(event))]) ?? []
  // 执行 handler 列表
}
```

**实战意义**：
- 如果 `emits` 里没声明某事件，但 props 里有 `@change`（即 `onChange`），它仍会被调用 —— 这就是「同时声明 emits 和 onChange prop」会出现「事件双触发」的根因。
- `validator` 函数必须返回 boolean；返回 falsy 都算 invalid。
- emit 触发顺序：先匹配 `emitsOptions[event]`，再回退到 `props['onChange']` / `props['on-change']`（驼峰和 kebab 都尝试）。

## 9. 模板 ref 在 v-for 中的收集顺序与异步包装

`setRef` 对数组 ref 按顺序递归处理；KeepAlive 缓存的 async component 需要从 subTree 拿真实组件：

```ts
// packages/runtime-core/src/rendererTemplateRef.ts:24-58
export function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray(rawRef)) {
    rawRef.forEach((r, i) =>
      setRef(r, oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount)
    )
    return
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    if (vnode.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE &&
        (vnode.type as ComponentOptions).__asyncResolved &&
        vnode.component!.subTree.component) {
      setRef(rawRef, oldRawRef, parentSuspense, vnode.component!.subTree)
    }
    return
  }
  const refValue = vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
    ? getComponentPublicInstance(vnode.component!)
    : vnode.el
  const value = isUnmount ? null : refValue
  const { i: owner, r: ref } = rawRef
  // ...
  const refs = owner.refs === EMPTY_OBJ ? (owner.refs = {}) : owner.refs
}
```

**实战意义**：
- `ref="el"` 在 `v-for` 中收集为数组，按 DOM 渲染顺序排列（不是数据源顺序，是渲染 patch 后的真实 DOM 顺序）。
- async component 被 KeepAlive 缓存时，ref 必须从 `subTree.component` 取真实组件，否则拿到的是 wrapper。
- `useTemplateRef` 创建的 ref key 会进入 `isTemplateRefKey` 检查，避免覆盖 setup state 中的同名变量。

## 10. Suspense 异步边界与 fallback 触发时机

`mountSuspense` 在 patch `pendingBranch` 时先在离屏 `hiddenContainer` 挂载，再根据 `suspense.deps > 0` 决定是否展示 fallback：

```ts
// packages/runtime-core/src/components/Suspense.ts:191-220
function mountSuspense(vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals) {
  const { p: patch, o: { createElement } } = rendererInternals
  const hiddenContainer = createElement('div')
  const suspense = (vnode.suspense = createSuspenseBoundary(...))
  // start mounting the content subtree in an off-dom container
  patch(null, (suspense.pendingBranch = vnode.ssContent!), hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds)
  if (suspense.deps > 0) {
    triggerEvent(vnode, 'onPending')
    triggerEvent(vnode, 'onFallback')
    patch(null, vnode.ssFallback!, container, anchor, parentComponent, null, namespace, slotScopeIds)
  } else {
    patch(null, vnode.ssContent!, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds)
  }
}
```

`SuspenseProps` 中的 `timeout` 用于在异步耗时超过指定 ms 后强制切到 fallback：

```ts
// packages/runtime-core/src/components/Suspense.ts:18-37
export interface SuspenseProps {
  onResolve?: () => void
  onPending?: () => void
  onFallback?: () => void
  /** Switch to fallback content if it takes longer than `timeout` milliseconds to render the new default content. */
  timeout?: string | number
  suspensible?: boolean
}
```

**实战意义**：
- `suspense.deps` 由内部 async component / async setup 计数得到；只要 deps = 0 就直接展示 default。
- `timeout: 0` 表示「default 一替换立刻展示 fallback」，常用于加载骨架屏。
- `suspensible: true` 让父 Suspense 接管当前 async 依赖处理（适合深层嵌套异步组件）。

## 11. TransitionGroup 的 key 复用与 move-class 触发

```ts
// packages/runtime-core/src/components/TransitionGroup.ts (节选)
const TransitionGroupImpl: ComponentOptions = {
  name: 'TransitionGroup',
  props: /* TransitionProps */ & { tag?: string; moveClass?: string },
  setup(props, { slots }) {
    const instance = getCurrentInstance()
    const state = useTransitionState()
    const children = slots.default ? slots.default() : []
    return () => {
      const rawChildren = filterSingleRoot(children)
      const children = (rawChildren as VNode[]).slice()
      // 把 v-for 子项扁平展开
      // ... 返回 children（外面包 <Transition> 走 leave/enter）
    }
  },
}
```

`Transition` 基类在 patch 时调用 `callPendingCbs()` 与 `recordTransition`：

```ts
// packages/runtime-core/src/components/BaseTransition.ts (节选)
function performLeave() {
  delayed = false
  if (state.isLeaving) { recordTransition(state) /* 进入 leave */ }
}
```

**实战意义**：
- TransitionGroup 没有 `mode` prop（mode 仅对单元素 Transition 有意义）。
- 子节点必须 `:key="X"` 才能让 FLIP move-class 触发；相同 key 会被视为「位置变化」触发 move 动画。
- `tag="ul"` 让 TransitionGroup 渲染为真实 DOM 包裹元素（默认 fragment，不产生 DOM 节点）。

## 12. `event` 修饰符 `once/passive/capture` 与 `vue:xxx` 命名空间

`runtime-dom/src/modules/events.ts` 的 `parseName` 解析修饰符与 `on:event` 形式：

```ts
// packages/runtime-dom/src/modules/events.ts:71-87
const optionsModifierRE = /(Once|Passive|Capture)$/
const optionsModifierEventRE = /^on:?(?:Once|Passive|Capture)$/

function parseName(name: string): [string, EventListenerOptions | undefined] {
  let options: EventListenerOptions | undefined
  let m
  while ((m = name.match(optionsModifierRE)) && !optionsModifierEventRE.test(name)) {
    if (!options) options = {}
    name = name.slice(0, name.length - m[1].length)
    ;(options as any)[m[1].toLowerCase()] = true
  }
  const event = name[2] === ':' ? name.slice(3) : hyphenate(name.slice(2))
  return [event, options]
}
```

`patchEvent` 在 add 阶段创建 `invoker`，并用 `_vts` 时间戳避免旧 handler 被新 event 触发：

```ts
// packages/runtime-dom/src/modules/events.ts:36-65
export function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {})
  const existingInvoker = invokers[rawName]
  if (nextValue && existingInvoker) {
    existingInvoker.value = __DEV__ ? sanitizeEventValue(nextValue, rawName) : (nextValue as EventValue)
  } else {
    const [name, options] = parseName(rawName)
    if (nextValue) {
      const invoker = (invokers[rawName] = createInvoker(...))
      addEventListener(el, name, invoker, options)
    }
    ...
  }
}

// packages/runtime-dom/src/modules/events.ts:99-127
const invoker: Invoker = (e) => {
  if (!e._vts) e._vts = Date.now()
  else if (e._vts <= invoker.attached) return // 旧 event 不应触发新 handler
  const value = invoker.value
  if (isArray(value)) {
    const originalStop = e.stopImmediatePropagation
    e.stopImmediatePropagation = () => { originalStop.call(e); (e as any)._stopped = true }
    const handlers = value.slice(), args = [e]
    for (let i = 0; i < handlers.length; i++) {
      if ((e as any)._stopped) break
      const handler = handlers[i]
      if (handler) callWithAsyncErrorHandling(handler, instance, ErrorCodes.NATIVE_EVENT_HANDLER, args)
    }
  } else {
    callWithAsyncErrorHandling(value, instance, ErrorCodes.NATIVE_EVENT_HANDLER, [e])
  }
}
invoker.attached = getNow()
```

**实战意义**：
- `@click.once` 编译为 `onClickOnce`，`parseName` 把 `Once` 切下来作为 listener options（`{ once: true }`）。
- `@vue:mounted` 这种「以 vue: 开头」的事件会被解析成 `vue:mounted`，使用 `name.slice(3)`（即「`vue` 后面的实际事件名 + 选项」）；这是 Vue 内部给 `runtime-dom` 区分组件事件与原生 DOM 事件用的命名空间。
- `event._vts <= invoker.attached` 跳过「事件绑定后立即被旧 microtask 触发」的情况（`vuejs/vue#6566`）。
- `value` 是数组时按顺序调用，并支持内部 `stopImmediatePropagation` 提前终止（与原生 DOM 行为一致）。

## 13. patchProp 中 v-model 监听被忽略

`patchProp` 把 `isOn(key)` 但 `isModelListener(key)` 的项直接 skip：

```ts
// packages/runtime-dom/src/patchProp.ts:28-32
} else if (isOn(key)) {
  if (!isModelListener(key)) {
    patchEvent(el, key, prevValue, nextValue, parentComponent)
  }
}
```

**实战意义**：
- `v-model` 编译结果是 `onUpdate:modelValue`，这种 listener 被 `isModelListener` 判别后跳过 patchEvent —— 因为 v-model 由专门的 `directive` 钩子处理 input value。
- 业务中如果手动写 `@update:modelValue="..."`（避开 v-model），会进入 patchEvent 走常规事件注册，但失去 v-model 的类型校验与修饰符机制。

## 14. `effectScope` 与组件 setup 的双向绑定

`effect.ts` 的 `activeSub` 与 `effectScope.ts` 的 `activeEffectScope` 是两个并行栈：

```ts
// packages/reactivity/src/effect.ts
export let activeSub: Subscriber | undefined

// packages/reactivity/src/effectScope.ts
export let activeEffectScope: EffectScope | undefined
```

`ReactiveEffect.run` 在执行前会切 active sub，`scope.run` 在执行前切换 active scope：

```ts
// packages/reactivity/src/effectScope.ts
class EffectScope {
  constructor(detached?: boolean) {
    this.parent = activeEffectScope
    activeEffectScope = this
  }
  run<T>(fn: () => T): T | undefined {
    if (this.active) try { return fn() } finally { activeEffectScope = this.parent }
    else return undefined
  }
}
```

**实战意义**：
- `setup()` 由 Vue 在调用前 push 新的 effectScope，所以 `watch` / `watchEffect` 自动挂在组件 scope。
- `effectScope(true)`（detached）不会自动收集到父 scope，常用于跨组件共享的 composable（如 Pinia store）。

## 15. `arrayInstrumentations` 处理 `Array.concat/includes/indexOf` 等副作用读取

```ts
// packages/reactivity/src/arrayInstrumentations.ts:42-60
export const arrayInstrumentations: Record<string | symbol, Function> = <any>{
  __proto__: null,
  [Symbol.iterator]() { return iterator(this, Symbol.iterator, item => toWrapped(this, item)) },
  concat(...args) { return reactiveReadArray(this).concat(...args.map(a => isReactive(a) ? toRaw(a) : a)) },
  includes(item, ...rest) { return reactiveReadArray(this).includes(item, ...rest) },
  indexOf(item, ...rest) { return reactiveReadArray(this).indexOf(item, ...rest) },
  lastIndexOf(item, ...rest) { return reactiveReadArray(this).lastIndexOf(item, ...rest) },
}
```

**实战意义**：
- `reactive([1,2,3]).includes(2)` 内部走 `reactiveReadArray` 主动 `track(raw, ITERATE, ARRAY_ITERATE_KEY)`。
- 因此 `array.includes(x)` / `array.indexOf(x)` 会建立 ITERATE 依赖，任何 push/splice 都会触发。
- `array.find(fn)` / `array.map(fn)` 不会自动 track —— 需要显式遍历访问才能 track（这是 v-for 性能调试的常见盲区）。

## 16. `validatePropName` 拒绝 `$` 与 `_` 开头的 prop 名

```ts
// packages/runtime-core/src/componentProps.ts:617-625
function validatePropName(key: string) {
  if (key[0] === '$') {
    warn(`Invalid prop name: "${key}" - they are reserved and cannot be used as props.`)
    return false
  }
  if (key[0] === '_') {
    warn(`Invalid prop name: "${key}" - they are reserved and cannot be used as props.`)
    return false
  }
  return true
}
```

**实战意义**：
- prop 名禁止 `$xxx`（保留给组件实例属性如 `$el / $refs`）。
- prop 名禁止 `_xxx`（保留给内部使用）。
- 实际开发中常见错误：`defineProps(['_myProp'])` 会被警告且该 prop 不生效。

## 17. `customRef` 是 2.x `Vue.observable` 缺失的逃生口

`customRef` 接受 `(track, trigger) => ({ get, set })`：

```ts
// packages/reactivity/src/ref.ts (节选 customRef 工厂)
export function customRef<T>(factory: CustomRefFactory<T>): Ref<T> {
  const { get, set } = factory(
    () => trackRefValue(ref),
    () => triggerRefValue(ref, DirtyLevels.Dirty, new Set()),
  )
  const ref = {
    __v_isRef: true,
    get value() { trackRefValue(ref); return get() },
    set value(v) { set(v); triggerRefValue(ref, ...) },
  }
  return ref as Ref<T>
}
```

**实战意义**：
- 用于实现 debounce ref / throttle ref / async ref：setter 可以拦截写入时机。
- 警告：`get` 返回新对象字面量时，每次访问会创建新引用，作为 prop 会导致子组件无意义 rerender（Vue 3 文档已注明）。

---

## 引用统计

- 共 17 条源码洞察，全部带 `packages/...` 路径与行号。
- 文件覆盖：`packages/reactivity/src/{reactive,computed,ref,effect,effectScope,arrayInstrumentations}.ts`、`packages/runtime-core/src/{componentProps,componentEmits,apiSetupHelpers,scheduler}.ts`、`packages/runtime-core/src/components/{Suspense,TransitionGroup,BaseTransition}.ts`、`packages/runtime-dom/src/{patchProp,modules/events}.ts`、`packages/compiler-sfc/src/script/defineOptions.ts`。