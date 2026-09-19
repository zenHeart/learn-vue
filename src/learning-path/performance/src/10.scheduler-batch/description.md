> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: 调度批处理

# 调度批处理：连续 100 次修改只触发一次更新

## 你会学到什么

- Vue 默认在同一 tick 内合并多次 ref 修改为一次组件 update
- `flushSync` 强制同步刷新（绕过调度队列）
- 同步模式下每次修改都触发渲染，DOM 操作 N 次

## 真实场景（抽象）

一个计数器，连续 100 次 `counter.value++`。两种策略：
- ① 默认异步调度：组件 update 1 次
- ② `flushSync` 包裹：组件 update 100 次

## 动手试

1. 点击「普通 100 次累加」 — render 计数 +1
2. 点击「flushSync 100 次」 — render 计数 +100
3. 观察「渲染次数」指标差异

## 根因

Vue 在 `queueJob` 中合并同一组件的多次 effect 调度，下个 microtask flush 一次。`flushSync` 把队列里的任务立刻执行，跳过 batch。

## 修复 / 选型

- 默认使用调度：连续状态变更天然合并
- 需要立即读 DOM 后状态：包一层 `await nextTick()`，比 `flushSync` 更安全
- 第三方库同步接入：`flushSync(() => { ... })`

## 延伸阅读

- [Reactivity — Scheduling](https://vuejs.org/guide/extras/reactivity-in-depth.html#scheduling)
- [Vue 源码洞察：渲染器异步批处理：queueJob + flushJobs](_analysis/vue-source-insights.md#渲染器异步批处理queuejob--flushjobs) | `packages/runtime-core/src/scheduler.ts:62-67` 引用

## 小结

1. **现象**：连续修改性能 vs 强制同步。
2. **复现**：对比 render 计数。
3. **修复**：默认异步，仅必要时 `flushSync`。
