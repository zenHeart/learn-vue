# effect 直接读取 computed 的依赖追踪 {#computed-with-effect}

> **版本**：Vue 3.0+ | **状态**：stable | **源码**：`packages/reactivity/src/effect.ts:1-90` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/reactivity-core.html#effect) | [内部 API 指南](https://vuejs.org/api/reactivity-advanced.html#effectscope)

`effect()` 是 Vue 响应式系统的「底层齿轮」：`watchEffect` / `computed` / `watch` 都在它之上构建。直接调用 `effect(fn)` 会立即执行一次 fn、把 fn 内访问到的响应式数据收集到自己的 `dep` 集合；当依赖变化时重新跑 fn。本 demo 演示两个实战要点：

1. **手动 effect 跟踪 computed**：可以比 `watchEffect` 更精细地控制「何时订阅、何时停止」。
2. **自定义 lazy / scheduler effect**：构造一个**永不自动运行**的 effect，仅在显式 `trigger()` 时刷新 —— 这在构建受控派生值时很有用。

## 这是什么 {#what}

```ts
import { effect, ref, computed } from 'vue'

const a = ref(1)
const b = ref(2)
const sum = computed(() => a.value + b.value)

// 默认 effect：和 watchEffect 等价 —— 创建时立即执行，依赖变化自动重跑
const stop = effect(() => {
  console.log('sum =', sum.value)   // 会订阅 sum（间接订阅 a、b）
})

// 自定义 lazy effect：只在显式 trigger 时刷新
let lazyValue: number | null = null
const lazy = effect(() => {
  lazyValue = a.value * 10
}, { lazy: true })
console.log(lazyValue)  // 初始 null —— lazy 不立即执行
```

## 源码走读 {#source}

```ts
// packages/reactivity/src/effect.ts (节选)
export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions): ReactiveEffectRunner<T> {
  const _effect = new ReactiveEffect(fn)
  if (options?.scheduler) _effect.scheduler = options.scheduler
  if (options?.lazy) return _effect.run.bind(_effect) as any   // lazy 不主动 run
  else _effect.run()         // 默认立刻执行
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}
```

关键事实：

- 默认 `effect(fn)` 创建时立即执行 `fn`，相当于 `watchEffect(fn)`。
- `effect(fn, { lazy: true })` 不主动 run，需要外部调用 `runner()` 时才执行；适合用作「按需计算 + 自动订阅」的派生函数。
- `effect(fn, { scheduler })` 把「依赖变化时该做什么」从默认重跑改成自定义函数 —— `computed` / `watchPostEffect` 都基于这个 hook 实现。
- `runner.effect.stop()` 可以手动解绑；多次 stop 是幂等的。

## 实战场景 {#production}

1. **懒计算 + 缓存**：把派生量写成 `effect(fn, { lazy: true })`，需要时 `runner()`；比 `computed` 更灵活（可自定义触发时机、不缓存上一次结果）。
2. **桥接到外部系统**：第三方库（图表库、动画库）需要「在依赖变化时调它自己的 API」—— 用 `effect(() => chart.setOption(deps), { scheduler: () => queueTask(chart.update) })`。
3. **单测 effect 副作用**：直接断言 `effect(() => counter++); trigger(counter.dep)` 来验证 dep 链路，不需要启组件。
4. **解耦跨组件响应式**：用 `effect` 把响应式数据流推给「非 Vue DOM」（Canvas / WebGL / Worker），避免 watchEffect 隐式挂到组件 scope。

## 常见踩坑 {#pitfalls}

- `effect` 收集依赖时若 fn 抛错，错误会向调用栈上抛 —— 不会进入 `errorHandler`（那是应用层的兜底）。
- `effect` 不会自动停止；长生命周期的副作用（如全局 store）必须自己 `runner.effect.stop()`，否则组件 unload 后内存泄漏。
- `lazy: true` 的 effect 不能用 `effect(fn, { scheduler })` 同时出现 —— 两者是互斥的两种定制方式。
- 不要在 `effect` fn 内部修改正在被订阅的 ref —— 会触发同步递归；用 `computed` 或「先解后置」改写。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/reactivity-advanced.html#effectscope) | 进阶响应式 API 索引 |
| [Vue 源码 · effect.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/effect.ts) | ReactiveEffect 与 effect() |
| [Vue 源码洞察：computed 与 effect 的 lazy 触发](_analysis/vue-source-insights.md#computed-xxx) | 隐式经验 |
| [Vue 源码 · computed.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/computed.ts) | computed 如何复用 effect 的 scheduler |