# Vue 性能优化

基于真实 Electron 客户端（nn-client-all）分页下拉卡顿排查案例，抽象出可交互的 MVP 演示。

## 典型性能问题

| 热点 | 表现 | 根因 |
|------|------|------|
| **B：响应式代理 spread** | 滚动分页时长任务 3–5s | computed 里 `{ ...reactiveEntity }` 逐键注册依赖，规模 O(房间数×字段数) |
| **A：IPC 回调风暴** | 空闲也占半核 CPU | 主进程高频转发 + 渲染侧逐条 JSON.parse / 分发 |
| 无意义深拷贝 | 列表重建变慢 | cloneDeep / 只读 Proxy 展开 |
| deep watch 承重 | 任意字段变更触发整表 | 应用层 mutation 与 watch 粒度不匹配 |

## Demo 列表

1. [组队列表投影性能](./src/01.reactive-spread-projection/) — 复现 `buildLegacyTeamListProjection` 问题，开关对比优化前后

## 案例来源

- 提交：`nn-client-all@166d6d2a`（`perf(channelList): 组队投影 raw 化`）
- Trace：分页下拉 Profile，投影自身 ~5.3s / 占采样 26.5%
- 微基准：300 房 × 53 字段，重建 11.32ms → 2.14ms（**5.3×**）
