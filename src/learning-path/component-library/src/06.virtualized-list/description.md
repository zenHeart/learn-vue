> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: 虚拟滚动列表

# 06 · 虚拟滚动列表（mini 实现）

## 你会学到什么

Element Plus `<el-table-v2>`、Naive UI `<n-data-table>`、Ant Design Vue `<a-table virtual>` 内部都是虚拟滚动。

原理：

1. 容器有固定高度
2. 只渲染**视口可见的行 + 缓冲区**
3. 用一个**总高度的占位 div**撑出滚动条
4. 监听 scroll → 算 startIndex / endIndex → 只渲染区间内行

本 demo 实现一个**纯手写迷你虚拟列表**，覆盖三种模式：

- **固定行高**（最简单的场景）
- **动态行高**（每行高度不同，需预估 + 实测修正）
- **对比**：全量渲染同样数据，演示卡顿

## 真实场景（抽象）

> "我们的订单管理页要展示 10 万行，普通 table 直接卡死。
> Element Plus `<el-table>` 默认会全量渲染，需要用 `<el-table-v2>` 虚拟滚动。
> 但我想先在 demo 里看明白原理。"

本 demo 用 10 万行 DOM 渲染对比，让你直观感受差距。

## 动手试

1. 选「固定行高 / 动态行高」切不同模式
2. 选「全量渲染」—— 滚到底观察卡顿（dev REPL 中可达 5s+）
3. 选「虚拟滚动」—— 滚到底秒切，DOM 节点数永远 ~30 个
4. 看「可视范围: row N — M」与「已渲染 DOM 数: X」，体会虚拟化的本质

## 关键模式

### 总高度 + 偏移

```vue
<template>
  <div class="viewport" @scroll="onScroll">
    <div class="phantom" :style="{ height: totalHeight + 'px' }" />
    <div class="rendered" :style="{ transform: `translateY(${offsetY}px)` }">
      <div v-for="row in visibleRows" :key="row.id" class="row">
        {{ row.text }}
      </div>
    </div>
  </div>
</template>
```

- `.phantom` 撑出滚动条（`height = totalRows * rowHeight`）
- `.rendered` 通过 translateY 移到当前可见位置
- `visibleRows` 只包含视口 + 缓冲区的行

### startIndex 算式（固定行高）

```ts
const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferSize)
const endIndex = Math.min(total, startIndex + visibleCount + bufferSize * 2)
const offsetY = startIndex * rowHeight
```

### 动态行高

需要：

1. **预估**高度（如每行 50px）撑出滚动条
2. **实测**：每行渲染后 `getBoundingClientRect()` 拿真实高度
3. **修正**：把真实高度写回累计高度表 `positionMap[i]`
4. 用 `positionMap` 二分查 startIndex

实现复杂但用户体验最好。

## 对比

| 库 | 实现 | 动态行高 | 性能 |
|----|------|----------|------|
| Element Plus `el-table-v2` | 自己实现，支持横向+纵向 | ✓（estimatedRowHeight） | 10 万行 60fps |
| Naive UI 内部用 `vueuc` | 通用虚拟列表 | ✓ | 同 |
| Ant Design Vue virtual | RcVirtual 改写 | ✓ | 同 |
| React Virtual | 单纯原理 | ✓ | — |

## 适用场景

- 表格行数 ≥ 1000 → 必须用虚拟滚动
- 长列表 / 时间线 / 日志
- 任何「外层 div 有 height: 固定 + overflow: auto + 内层大列表」

## 常见陷阱

1. **容器必须有固定 height**：否则没有 scroll，虚拟化失效
2. **行内若有图片 / 异步内容**：行高会变，需 ResizeObserver 监听 + 修正
3. **搜索 + 滚动联动**：滚动时过滤 → startIndex 突变，可能闪屏
4. **横向虚拟滚动**：本 demo 只演示纵向；横向需同时虚拟列

## 进阶

- 回收 DOM 节点池（避免大量 createElement）
- 滚动节流（rAF / requestIdleCallback）
- `IntersectionObserver` 替代 scroll 监听（更优性能）
- 嵌套虚拟（行内格子再虚拟）

## 延伸阅读

- [Element Plus TableV2](https://element-plus.org/en-US/component/table-v2.html)
- [vueuc VirtualList](https://github.com/07akioni/vueuc)
- [TanStack Virtual](https://tanstack.com/virtual/latest)

## 下一步

07 · 按需引入样式 —— 虚拟列表解决了 DOM 数量，
07 教你把「样式代码不进主 bundle」做到极致。
