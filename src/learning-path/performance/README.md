# Vue 性能优化

基于大型数据结构场景的交互式演示，覆盖 Vue 响应式系统在生产应用中常见的性能问题与官方推荐优化手段。

## 分类索引

| 类别 | 关注点 | 代表 demo |
|------|--------|-----------|
| 响应式开销 | 依赖追踪粒度、ref / reactive / shallow 选型 | `01`, `02`, `08`, `09`, `12` |
| 列表与渲染 | 虚拟化、v-memo、KeepAlive 缓存 | `03`, `04`, `07` |
| 调度与时序 | 批处理、flush 选项、rAF / nextTick | `10`, `11` |
| 打包与加载 | bundle 分析、动态 import、SSR | `05`, `07` |
| API 与语义 | computed 替代模板表达式、watch 精度 | `03`, `06` |
| 不可变数据 | 拷贝策略、冻结对象 | `12`, `13` |

## Demo 列表

1. [列表投影性能](./src/01.reactive-spread-projection/) — spread reactive 的逐键追踪代价
2. [响应式开销基准](./src/02.reactive-overhead-bench/) — reactive vs shallowReactive vs ref vs shallowRef
3. [computed vs 模板表达式](./src/03.computed-memo-vs-getter/) — 缓存语义与 onTrack 量化
4. [v-memo 列表](./src/04.v-memo-list/) — 跳过未变更项
5. [KeepAlive 缓存策略](./src/05.keepalive-include-excludes/) — include / max LRU 行为
6. [打包分析](./src/06.bundle-analyze-demo/) — 动态 import 与 chunk 拆分
7. [虚拟滚动](./src/07.virtualized-list-perf/) — 1 万行渲染与 FPS
8. [SSR vs CSR mock](./src/08.ssr-vs-csr/) — 首屏 LCP 与 hydration 成本
9. [深嵌套响应式基准](./src/09.reactive-deep-vs-shallow-bench/) — 五层嵌套批量更新
10. [调度批处理](./src/10.scheduler-batch/) — 连续多次写入与 flushSync
11. [nextTick vs rAF](./src/11.nexttick-vs-raf/) — 微任务与动画帧
12. [watchEffect flush 选项](./src/12.watch-effect-flush-options/) — pre / post / sync 与 DOM 时序
13. [响应式 vs 不可变数据](./src/13.reactive-vs-immutable/) — Object.freeze 与 structuredClone

## 验证方式

- 浏览器 REPL：`onTrack` / `onTrigger` + `performance.now()` 量化
- 官方文档：Performance 指南、Reactivity API、Built-in Components
- DevTools：Vue DevTools 的 Performance 面板、Chrome Performance 面板
