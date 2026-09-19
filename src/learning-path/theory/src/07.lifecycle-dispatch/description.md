> 版本: Vue 3.x | 源码: packages/runtime-core/src/component.ts, packages/runtime-core/src/lifecycle.ts | 难度: 中等

# 07 · 生命周期调度与 currentInstance

## 原理是什么

Vue 3 用 `currentInstance` 全局变量 + `getCurrentInstance()` 暴露 API，让 `onMounted`/`onUnmounted` 等钩子无需显式接收 component 参数。它在 setup 内被设置，在 setup 结束时被清除；同时 `inject()` 内部也用这个变量判断"谁在调用 inject"。

调用顺序由 mount/unmount 的递归顺序决定：

- **mount**：父 beforeMount → 子 beforeMount → 子 mounted → 父 mounted（先深后冒泡）
- **unmount**：父 beforeUnmount → 子 beforeUnmount → 子 unmounted → 父 unmounted

SSR 下 `mounted` 等含 DOM 的钩子被跳过（通过 `isInSSR` 标志位 + 运行时检查 `instance.isMounted` 路径）。

## 一步步走读源码

源码定位：

- `packages/runtime-core/src/component.ts` 第 1100-1130 行：`setCurrentInstance` / `unsetCurrentInstance` / `getCurrentInstance`。
- `packages/runtime-core/src/lifecycle.ts` 第 30-90 行：`injectHook` 把钩子函数注册到 `instance.hooks[type]`。
- `packages/runtime-core/src/renderer.ts`：`componentUpdateFn` 内通过 `queuePostRenderEffect` 把 mounted 钩子放入 post 队列。

关键片段：

```ts
// lifecycle.ts
export function injectHook(type: LifecycleHooks, hook, target = currentInstance) {
  if (target) {
    const hooks = target[type] || (target[type] = [])
    const wrappedHook = (...args) => {
      // SSR 时跳过 mounted
      if (target.isUnmounted) return
      pauseTracking()
      const reset = setCurrentInstance(target)
      const res = callWithAsyncErrorHandling(hook, target, type, args)
      reset()
      resetTracking()
      return res
    }
    hooks.push(wrappedHook)
    return wrappedHook
  } else if (__DEV__) warn('onXxx is called when there is no active component instance')
}

export const onMounted = (hook, target) =>
  target ? injectHook(LifecycleHooks.MOUNTED, hook, target)
        : injectHook(LifecycleHooks.MOUNTED, hook)

// renderer.ts (摘)
const componentUpdateFn = () => {
  if (!instance.isMounted) {
    setupRenderEffect(...) // 首次
    if (instance.proxy && instance.vnode.props?.ref) setRef(instance)
    // mounted 是异步的：放在 post 队列，保证 DOM 已就绪
    queuePostRenderEffect(() => instance.mounted?.forEach(h => h()), instance.uid)
  } else {
    // beforeUpdate / update
    queuePostRenderEffect(() => instance.updated?.forEach(h => h()), instance.uid)
  }
}
```

## 为何这样设计

- **currentInstance 是单向变量**：setup 内可读，setup 外调用 warn；天然防止跨组件注册钩子。
- **mounted 异步执行**：render 函数只是修改 VNode，真正的 DOM 插入发生在 patch 完成的下一帧（post 队列）。
- **SSR 跳过**：服务端没有 DOM，挂载钩子无意义，调用会抛错或警告。

## 性能与权衡

- mounted 异步队列：避免 render 阶段触发同步副作用阻塞更新。
- 跨组件钩子乱序（如 setup 内调用 onXxx 但被传给另一个组件）会被警告。

## Vue 官方延伸阅读

- 官方文档: <https://cn.vuejs.org/api/composition-api-lifecycle.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/lifecycle.ts>

## 对应 RFC

RFC 99: Function-based Component API（lifecycle 注册入口由 options API 改为 composition 风格）

## 延伸：可手写极简版本验证

demo `07.lifecycle-dispatch/App/App.vue` 模拟父子组件 mount/unmount 的钩子顺序，并在 UI 中用时序图展示。

## 参考资料

- 《Vue.js 设计与实现》霍春阳，第 11 章「生命周期」
- 《Vue 技术揭秘》生命周期篇 <https://ustbhuangyi.github.io/vue-analysis/lifecycle/>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/lifecycle.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：event 修饰符 once/passive/capture 与 vue:xxx 命名空间](_analysis/vue-source-insights.md#event-修饰符oncepassivecapture-与-vuexxx-命名空间) | `packages/runtime-dom/src/modules/events.ts:71-88` 引用
- [Vue 源码洞察：渲染器异步批处理：queueJob + flushJobs](_analysis/vue-source-insights.md#渲染器异步批处理queuejob--flushjobs) | `packages/runtime-core/src/scheduler.ts:62-67` 引用
