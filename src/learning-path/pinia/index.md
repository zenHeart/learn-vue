# Pinia 学习路径

Pinia 是 Vue 3 推荐的状态管理库，本路径覆盖从最基础的 `defineStore` 到测试、插件、SSR 兼容等 11 个主题。每个 demo 都给到可独立运行的 Vue 3 + TS 代码片段，覆盖真实业务：购物车、订单状态、登录态、持久化、跨 store 协调等。

## 目录结构

- `01.basic` — Options Store 最简示例
- `02.setup-store` — Setup Store 写法：`defineStore('cart', () => { ... })`；与 Options Store 的取舍；自动 ref 解包
- `03.store-state-and-actions` — `storeToRefs(store)` 解构保持响应式；`store.$reset()`、`store.$patch({...})`、`store.$patch(state => ...)`
- `04.getters-and-computed` — Pinia getter 自动 computed；与 React.useMemo 的对比；getter 间依赖；return 函数参数化 selector
- `05.actions-async` — Action 中可异步；`store.fetchUser()`；Suspense 集成；与 Vue Query 等数据层的关系（不引战，给选择参考）
- `06.subscribe-and-watch` — `store.$subscribe((mutation, state) => {})` mutation.payload；持久化插件雏形
- `07.cross-store-usage` — 在一个 store 的 action 中调用另一个 store；循环依赖的陷阱；模块化拆分
- `08.pinia-plugin` — 自定义插件：`myPlugin({store, options}) { store.hello = ...; store.$onAction(...) }`；实现一个持久化到 localStorage 的插件
- `09.options-vs-setup` — 横向对比 Options Store 和 Setup Store：TypeScript 友好度、SSR 一致性、SSR 状态注入、组合式工具复用
- `10.pinia-and-vuerouter` — Pinia + Router 集成：根据 store 权限控制导航；登录态的全局守卫实现；`store.$state` 重置 vs `$dispose`
- `11.testing-pinia-store` — Vitest 中测试 store：`createPinia()` + `setActivePinia(createPinia())`；mock actions；组件级测试