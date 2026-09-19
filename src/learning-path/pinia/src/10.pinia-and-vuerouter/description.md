> 版本: Pinia 2.x + Vue Router 4.x | RFC: — | 状态: stable | 概念: Pinia + Vue Router 组合

# 10 · Pinia + Vue Router 集成

常见模式：

- 在全局 `router.beforeEach` 中读 store 权限位；
- 在 store action 内调用 `router.push/replace` 完成"登录后跳转";
- 用户登出时 `store.$state = {}` 或 `store.$reset()` 清空全部 store，再导航到登录页；
- 配合 SSR 时用 `pinia.state.value = ...` 注入初始状态。

$state vs $reset vs $dispose：

- `store.$state = newState`：整体替换 state；
- `store.$reset()`：回到 `defineStore` 初始 state（仅 Options 默认支持）；
- `store.$dispose()`：销毁 store，下次再 `useXxx()` 会重新创建。

本 demo 演示一个"登录后才能访问管理后台"的完整闭环。