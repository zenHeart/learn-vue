# Vue Router

本路径把 Vue Router 4.x 的核心能力拆成 13 个可独立运行的 demo，从最基础的 `createRouter` 一路推进到权限拦截、Suspense 数据获取、组合式封装。每个 demo 都用真实的业务场景（订单、设置、商品、控制台）落地，避免抽象示例。

## 目录结构

- `01.history` — `createMemoryHistory` 在沙箱环境中的使用
- `02.dynamic-route` — `path: '/user/:id'` 动态参数；`useRoute().params` 响应式；与 `route.params` 的访问时机
- `03.nested-route` — `children` 配置；嵌套 `<router-view>`；命名视图（NamedView）`components: { default, sidebar }`
- `04.named-route` — `<router-link :to="{name, params, query}">`；命名路由 vs 路径字符串的优劣
- `05.programmatic-navigation` — `useRouter().push/replace/go/back`；参数与 query；Promise 返回与失败处理；`NavigationFailureType`
- `06.router-view-slot` — `<router-view v-slot="{Component, route}">`；过渡动画；KeepAlive 集成；component ref 访问
- `07.global-guard` — `router.beforeEach((to, from, next) => {})`；三个参数与返回值规范（`next` 已废弃，改为 `return true/false`）；异步守卫
- `08.route-guard` — `beforeRouteEnter`、`beforeRouteUpdate`、`beforeRouteLeave` 三者触发时机；与组合式 API 的 `onBeforeRouteUpdate`（4.x）对应
- `09.before-enter-guard` — 单路由 `beforeEnter`；组件级 `beforeRouteEnter`；进入权限控制示例（模拟登录）
- `10.fetch-on-navigation` — 导航前获取数据：`beforeRouteEnter` 中 fetch + `next(vm => vm.setData(...))`；与 `<Suspense>` + async setup 的对比；Vue 3 推荐做法
- `11.lazy-route` — `() => import('./Foo.vue')` 动态导入；`defineAsyncComponent` 配合；代码分包策略与 prefetch
- `12.scroll-behavior` — `createRouter({scrollBehavior(to, from, savedPosition) {}})`；savedPosition 后退保留、hash 锚点、自定义滚动坐标
- `13.composable-use-route` — 组合式封装 `useRouteQuery(name)` / `useRouteParam(name)` 响应式访问；与 `route.query` 解耦的封装模式