> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: 嵌套路由

# 03 · 嵌套路由与命名视图

两个常被混淆的能力：

- **嵌套路由**：父路由通过 `children` 描述子路由，子路由的组件会被渲染到父组件里的 `<router-view>` 中。
- **命名视图**：单个路由用 `components: { default: A, sidebar: B }` 同时给多个具名 `<router-view>` 注入不同组件。

本 demo 用一个"设置中心"页面演示：

- 顶部仍是父路由 `<router-view>`；
- 父组件内部另开一个 `<router-view>` 渲染子路由；
- 右侧用 `name="sidebar"` 的命名视图渲染独立组件，即使地址只切了"通知/账户"，侧栏也不重新挂载。