> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: 虚拟列表性能

# 虚拟滚动 vs v-for 渲染万行

## 你会学到什么

- 真实 `v-for` 渲染 1 万行的 FPS 与滚动卡顿
- 自写 mini 虚拟滚动（只渲染可视区 + buffer）的对比
- `performance.now()` 量化帧时间

## 真实场景（抽象）

1 万行表格，每行 5 列。两种渲染策略：
- ① 全量 `v-for`
- ② 自写虚拟滚动：滚动时只渲染可视区 ~20 行

## 动手试

1. 在「全量」模式下连续滚动 — 观察 FPS 是否跌到 20 以下
2. 切换「虚拟」— FPS 回到 50+
3. 观察 DOM 节点数：① ~10000，② ~30

## 根因

每帧浏览器都要布局 + 绘制所有节点。主线程在响应式更新 + 大量 DOM 操作下阻塞。虚拟滚动只渲染可见行，重排范围小。

## 修复 / 选型

- 万行级：自实现虚拟滚动或用 `vue-virtual-scroller` / `@tanstack/virtual`
- 千行级：v-memo + 简单分页即可
- 关键指标：DOM 节点数、scroll handler 节流、item 高度稳定

## 延伸阅读

- [Virtual Scroll Best Practices](https://vuejs.org/guide/best-practices/performance.html#virtualize-large-lists)

## 小结

1. **现象**：长列表滚动卡顿。
2. **复现**：对比两种实现的 FPS。
3. **修复**：虚拟滚动只渲染可视区。
