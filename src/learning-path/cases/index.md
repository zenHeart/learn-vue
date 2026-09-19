---
title: 从业务交付到机制与排错
---

# 从业务交付到机制与排错

三个任务分别验证业务状态契约、响应式核心机制和异步一致性。先在起始代码中解决问题，再查看参考解法。每个案例有真实可执行测试，固定输出不算测试结果。

1. [订单审核：从交互到状态契约](./learning.html#01.order-workflow)
2. [响应式核心：动态依赖与批处理](./learning.html#02.reactivity-core)
3. [异步竞态：让最新意图决定页面](./learning.html#03.request-race)

测试：`node --test tests/learning-cases.test.mjs`。解释、迁移与延迟保持按各单元任务另外评价。
