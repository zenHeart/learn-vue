# 生命周期完整时序：父 vs 子

> 版本：Vue 3.x | 状态：stable | 源码：`packages/runtime-core/src/apiLifecycle.ts` `renderer.ts` | 延伸阅读：[Vue 官方：生命周期](https://cn.vuejs.org/guide/essentials/lifecycle.html)

## 这是什么

组合式 API 用 `onBeforeMount / onMounted / onBeforeUpdate / onUpdated / onBeforeUnmount / onUnmounted` 六个钩子完整覆盖实例生命周期；父 vs 子钩子按**自顶向下挂载、自底向上卸载**的顺序触发。

```text
父 beforeMount → 子 beforeMount → 子 mounted → 父 mounted
父 beforeUpdate → 子 beforeUpdate → 子 updated → 父 updated
父 beforeUnmount → 子 beforeUnmount → 子 unmounted → 父 unmounted
```

所有 `on*` 钩子必须**同步**在 `setup()` 内调用；异步注册会抛 `on* is called when there is no active component instance to be associated with`。

## 源码走读

```ts
// packages/runtime-core/src/apiLifecycle.ts:73
export const onMounted: AsyncErrorHandler = createHook('mo', ...)
function createHook(lifecycle: LifecycleHooks) {
  return (hook, target = currentInstance) => {
    injectHook(lifecycle, hook, target)
  }
}
```

`injectHook` 把钩子塞进 `instance.hooks[lifecycle]`，渲染器在 mount/patch/unmount 阶段 `invokeArrayFns` 调用。

## 实战场景

1. 第三方命令式库挂载：在 `onMounted` 中初始化 echarts / mapbox，在 `onBeforeUnmount` 销毁避免泄漏。
2. 调试生命周期时序：在每个钩子内 `console.log` 即可观察父子先后。
3. 配合 `<KeepAlive>` 时额外触发 `onActivated / onDeactivated`（不在本节范围）。

## 常见踩坑

- 钩子内部 `await` 后**再调用** on* 钩子：会抛错（`currentInstance` 已丢失）。
- SSR 渲染阶段**不会**触发 `onMounted`；DOM 依赖放到 `onMounted` 内要确认是否 SSR。
- `onBeforeUpdate / onUpdated` 不保证触发顺序与 reactive 依赖关系——只保证"DOM 即将被更新"或"已被更新"。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方：生命周期](https://cn.vuejs.org/guide/essentials/lifecycle.html) | 生命周期流程图 |
| [Vue 官方：组合式 API](https://cn.vuejs.org/api/composition-api-lifecycle.html) | on* 钩子列表 |
| [Vue 源码：apiLifecycle.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiLifecycle.ts) | injectHook 实现 |