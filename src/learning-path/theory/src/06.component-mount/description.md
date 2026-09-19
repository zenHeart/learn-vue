> 版本: Vue 3.x | 源码: packages/runtime-core/src/component.ts, packages/runtime-core/src/renderer.ts | 难度: 中等

# 06 · 组件挂载全流程

## 原理是什么

Vue 3 的组件挂载可以拆为五步：① `createComponentInstance` 创建组件实例对象；② `setupComponent` 把 setup 结果、props、slots 装入实例；③ `setupRenderEffect` 创建带 scheduler 的渲染副作用；④ 调用 render 生成的 subTree；⑤ `patch` 把 subTree 转为真实 DOM（递归到子组件就是 `mountComponent`）。

每一步都伴随一组"调用钩子前的标志位"（`isInBeforeCreate`、`isInSetup`），通过 `currentInstance` 全局变量让 setup 内的 API（inject / onMounted 等）知道"我在哪个组件上下文里"。

## 一步步走读源码

源码定位：

- `packages/runtime-core/src/component.ts` 第 105-150 行：`createComponentInstance`。
- 同文件第 280-340 行：`setupComponent` 调用 `setupStatefulComponent`。
- 第 380-430 行：`setupStatefulComponent` 执行 setup、绑定 render、绑定 effect。
- `packages/runtime-core/src/renderer.ts` 第 1000-1060 行：`mountComponent` & `setupRenderEffect`。
- `packages/runtime-core/src/apiCreateComponent.ts`：`currentInstance` 与 `setCurrentInstance`。

关键片段（节选自 component.ts）：

```ts
export function setupComponent(instance, isSSR = false) {
  const { props, children } = instance.vnode
  const isStateful = isStatefulComponent(instance)
  initProps(instance, props, isStateful)
  initSlots(instance, children)
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : undefined
  return setupResult
}

function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type
  instance.accessCache = Object.create(null)
  instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers))
  const { setup } = Component
  if (setup) {
    const setupContext = createSetupContext(instance)
    setCurrentInstance(instance)
    pauseTracking()                      // 关键：setup 内访问 ref 不会触发依赖收集
    const setupResult = callWithErrorHandling(setup, instance, ErrorCodes.SETUP_FUNCTION, [props, setupContext])
    resetTracking()
    unsetCurrentInstance()
    handleSetupResult(instance, setupResult, isSSR)
  } else finishComponentSetup(instance, null, isSSR)
}
```

`setupRenderEffect` 把 `componentUpdateFn` 注册为 effect，scheduler 包裹后由 queue 统一调度；首次同步执行，调用 `render(instance.subTree)`，再交给 patch。

## 为何这样设计

- **统一 effect 通道**：组件更新与 watch、computed 共用调度器；同一微任务内多次 setState 自动合并。
- **currentInstance**：让 setup 内的 inject/onMounted 不需要显式传 instance 参数；同一个 setup 函数被多个组件复用时，每个组件能拿到自己的 instance。
- **pauseTracking**：setup 只执行一次，期间访问 ref/reactive 不应建立"setup -> ref"的依赖，否则会在组件重渲染时被错误收集。

## 性能与权衡

- 首次 mount 是同步的：渲染前必须生成 subTree；
- update 是异步的：scheduler 收到 trigger 后入队，等到 `nextTick` 微任务刷新；
- 与 Vue 2 比较：setup + render 函数每次都会跑，但虚拟 DOM diff 是同步阻塞；调度器层面做了"合并 + 异步"。

## Vue 官方延伸阅读

- 官方文档: <https://cn.vuejs.org/guide/extras/render-function.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/component.ts>

## 对应 RFC

RFC 99: Function-based Component API（setup 的前身）

## 延伸：可手写极简版本验证

demo `06.component-mount/App/App.vue` 用伪代码演示 createInstance -> setupComponent -> mountComponent 的状态转移，并在 UI 中显示各步骤的 trace。

## 参考资料

- 《Vue.js 设计与实现》霍春阳，第 18 章「编译器核心技术」
- 《Vue 技术揭秘》组件篇 <https://ustbhuangyi.github.io/vue-analysis/component/>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/component.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：effectScope 与组件 setup 的双向绑定](_analysis/vue-source-insights.md#effectscope与组件setup的双向绑定) | `packages/reactivity/src/effectScope.ts` 引用
- [Vue 源码洞察：模板 ref 在 v-for 中的收集顺序与异步包装](_analysis/vue-source-insights.md#模板-ref-在-v-for-中的收集顺序与异步包装) | `packages/runtime-core/src/rendererTemplateRef.ts:24-58` 引用
