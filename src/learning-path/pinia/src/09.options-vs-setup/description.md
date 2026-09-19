> 版本: Pinia 2.x | RFC: — | 状态: stable | 概念: Options store vs setup store

# 09 · Options Store vs Setup Store 横向对比

| 维度 | Options Store | Setup Store |
|---|---|---|
| 心智模型 | 类 Redux：state / getters / actions 三段 | 组合式函数：ref / computed / watch |
| TypeScript | state 推断不错，getters 与 actions 需要手动标类型 | 类型推断最自然，ref 推导直接给到 getter |
| SSR | 状态注入位置固定（`__INITIAL_STATE__`），生态丰富 | 需要手动实现 `hydrate()`；Vue 3.3+ 已逐步完善 |
| 复用 | 只能通过 mixin / 外部 composable | 直接调 `useXxx()`、可组合 vueUse 等 |
| `$reset` | 默认支持 | 需要手动实现 |
| 调试 | Pinia Devtools 完整支持 | 同样支持 |

实践建议：

- 团队刚迁自 Vuex：先用 Options Store 降低心智负担；
- 全新项目、希望最大化复用组合式工具：优先 Setup Store；
- 第三方插件（如 `pinia-plugin-persistedstate`）目前更偏好 Options Store。