> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: watchEffect flush 选项

# watchEffect flush 选项：pre / post / sync

## 你会学到什么

- `flush: 'pre'`（默认）：组件 update **之前**触发 watcher
- `flush: 'post'`：组件 update **之后**触发，能读到最新 DOM
- `flush: 'sync'`：每次状态变更立即触发，不进队列

## 真实场景（抽象）

一组状态驱动一段文本。三种 flush 模式下，每次点击 +1 时 watcher 的回调时机不同：
- pre：拿到的是「即将更新」的旧 DOM
- post：拿到的是「刚更新完」的新 DOM
- sync：每次 +1 立刻回调

## 动手试

1. 点击「+1」 — 观察日志「当前文本」「回调时文本」「回调时机」
2. 切换 flush 选项重复
3. 注意 `post` 模式下回调拿到的文本与当前视图一致；`pre` 拿到的是上一次

## 根因

Vue 默认把 watcher 调度到组件 update 之前（pre）。`post` 让 watcher 等 DOM patch 完再跑，能拿到最新的 `textContent`。`sync` 完全跳过队列。

## 修复 / 选型

- 模板 ref 操作：选 `post`
- 派生状态同步：默认 `pre` 即可
- 调试或边缘同步：临时用 `sync`，生产慎用

## 延伸阅读

- [watchEffect flush](https://vuejs.org/api/reactivity-core.html#watcheffect)
- [Vue 源码洞察：watchEffect / watch 的调度时机](_analysis/vue-source-insights.md#watcheffectwatch的调度时机) | `packages/runtime-core/src/apiWatch.ts, scheduler.ts:88-117` 引用

## 小结

1. **现象**：watcher 拿不到最新 DOM。
2. **复现**：切换 flush 选项观察回调值。
3. **修复**：按场景选 pre / post / sync。
