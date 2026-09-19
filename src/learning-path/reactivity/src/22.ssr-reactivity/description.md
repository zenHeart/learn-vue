# 服务端响应式：SSR 跨请求隔离与 hydration mismatch {#ssr-reactivity}

> 版本: Vue 3.x | RFC: 0001-composition-api | 状态: stable

SSR（Server-Side Rendering）模式下，每个请求都在同一个 Node 进程内执行 Vue 组件渲染。如果响应式状态定义在模块顶层（**模块作用域**），所有请求会**共享同一份数据**——这是经典的"用户 A 看到了用户 B 的数据"漏洞。

## 关键陷阱 {#pitfalls}

1. **模块级 ref / reactive**：跨请求污染，必须放进 `setup()` 或 `effectScope` 内。
2. **`onMounted` / `onUnmounted` 不执行**：SSR 阶段没有 DOM，组件只渲染一次。
3. **`useStore()` 等模块单例**：若 store 内部持有 `ref`，相当于模块级状态。修复方式是用 `effectScope` 包裹每个请求。
4. **Hydration mismatch**：SSR 输出的 HTML 与客户端首次渲染结果不一致。常见原因：
   - `Math.random()` / `Date.now()` 在两端调用时机不同。
   - `typeof window !== 'undefined'` 触发了不同分支。
   - `localStorage` 读取后影响了初始状态。

## 修复模式 {#patterns}

- **`createSSRApp` + Pinia / Vuex**：每个请求一个 store 实例。
- **手动 `effectScope`**：在请求 handler 中 `const scope = effectScope(); scope.run(() => ...)`，渲染完成后 `scope.stop()`。
- **`useState`（Nuxt 3）**：官方提供的每请求 ref。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · SSR 指南](https://vuejs.org/guide/scaling-up/ssr.html)
- [Vue 官方文档 · createSSRApp](https://vuejs.org/api/application.html#createssrapp)
- [Vue 3 SSR 指南 · 跨请求状态污染](https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution)
- [Nuxt useState](https://nuxt.com/docs/api/composables/use-state)
- [RFC 0001 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-composition-api.md)
- [Vue 源码洞察：effectScope 批量 dispose 副作用](_analysis/vue-source-insights.md#effectscope批量dispose副作用) | `packages/reactivity/src/effectScope.ts` 引用

<!-- description.md -->
