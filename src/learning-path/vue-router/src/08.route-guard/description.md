> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: 路由独享守卫 beforeEnter

# 08 · 路由组件守卫

组件内部可以声明 3 个守卫：

- `beforeRouteEnter(to, from)` — 组件实例化前，**不能访问 `this`**；通过 `next(vm => ...)` 拿组件实例。
- `beforeRouteUpdate(to, from)` — 同一组件被复用、参数变化时（典型场景：`/user/:id`）。
- `beforeRouteLeave(to, from)` — 离开前，常用于"未保存草稿"提示。

组合式 API 替代品：

- `onBeforeRouteUpdate` 等价于 `beforeRouteUpdate`；
- `onBeforeRouteLeave` 等价于 `beforeRouteLeave`；
- `beforeRouteEnter` 没有对应组合式 API，因为它依赖"组件尚未创建"这一前提。

本 demo 演示 3 个守卫在不同导航情形下的触发顺序。