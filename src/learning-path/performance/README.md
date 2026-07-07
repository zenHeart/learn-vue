# Vue 性能优化

基于虚拟列表分页场景的交互式演示，帮助理解 Vue 响应式系统在大型数据结构下的性能陷阱与优化手段。

## 典型问题

| 模式 | 表现 | 根因 |
|------|------|------|
| **computed 内 spread reactive** | 分页时卡顿、长任务 | 逐键注册依赖，O(项数×字段数) |
| 无意义深拷贝 | 列表重建变慢 | cloneDeep / Proxy 展开 |
| deep watch 承重 | 任意字段变更触发整表 | watch 粒度与 mutation 不匹配 |
| 每次 compute 新对象 | 下游全量更新 | 引用不稳定 |

## Demo

1. [列表投影性能](./src/01.reactive-spread-projection/) — spread vs toRaw 开关对比

## 验证方式

- 浏览器 REPL：`onTrack` 统计依赖数 + 基准测试对比
- 官方文档：Performance 指南、toRaw API、Computed Debugging
- 社区 issue：vue#6660、core#13613
