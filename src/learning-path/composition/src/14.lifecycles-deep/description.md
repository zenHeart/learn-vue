> 版本: Vue 3.x | 状态: stable (其中 onServerPrefetch 与 onRenderTracked 属于开发/SSR 工具)

# 全量生命周期钩子

Vue 3 组合式 API 提供与 Options API 一一对应的 `on*` 钩子函数：所有钩子必须在 `setup()` 同步执行期间注册，否则会抛 `on* is called when there is no active component instance to be associated with.`。

## 这是什么

```ts
import {
  onBeforeMount, onMounted,
  onBeforeUpdate, onUpdated,
  onBeforeUnmount, onUnmounted,
  onActivated, onDeactivated,
  onErrorCaptured, onRenderTracked, onRenderTriggered,
  onServerPrefetch,
} from 'vue'
```

每个钩子都接受回调，回调执行时机与 Options API 完全一致。`<KeepAlive>` 包裹时会额外触发 `activated` / `deactivated`；SSR 中 `onServerPrefetch` 用于等待数据请求完成。

## Vue 怎么实现

- 运行时：`packages/runtime-core/src/apiLifecycle.ts` 用 `injectHook` 实现，所有钩子注册到 `instance.hooks`（按生命周期 key 索引）
- 触发器：渲染器 `packages/runtime-core/src/renderer.ts` 在挂载/更新/卸载各阶段调用 `invokeArrayFns(hooks, ...args)`
- 渲染跟踪：`onRenderTracked` / `onRenderTriggered` 由 `packages/runtime-core/src/renderer.ts` 调试钩子触发

## 实战中什么时候用 / 什么时候不用

**用**：

- 在 `<script setup>` 内绑定资源清理 / 事件订阅
- 在 KeepAlive 缓存组件内监听激活

**不用**：

- 与模板同等的 data watch——用 `watchEffect` / `watch`
- SSR 中没必要写 `onMounted` 钩子

## 官方文档延伸阅读

- https://cn.vuejs.org/api/composition-api-lifecycle.html
- https://cn.vuejs.org/guide/essentials/lifecycle.html
- https://cn.vuejs.org/api/built-in-components.html#keepalive

## 常见踩坑

- 钩子必须在 setup 同步上下文注册；异步注册失效
- `onRenderTracked` 仅在 dev 模式生效
- `onErrorCaptured` 不会捕获异步错误与事件回调中抛出的错误
- `<KeepAlive>` 内若不写 `onActivated` 等价于不消费，但 dev 工具仍会标记

## 延伸阅读

- https://cn.vuejs.org/api/composition-api-lifecycle.html
- https://cn.vuejs.org/guide/essentials/lifecycle.html
- https://cn.vuejs.org/api/built-in-components.html#keepalive
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiLifecycle.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts
- [Vue 源码洞察：event 修饰符 once/passive/capture 与 vue:xxx 命名空间](_analysis/vue-source-insights.md#event-修饰符oncepassivecapture-与-vuexxx-命名空间) | `packages/runtime-dom/src/modules/events.ts:71-87` 引用
