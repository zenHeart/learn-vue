> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: nextTick 与动画帧

# nextTick vs requestAnimationFrame

## 你会学到什么

- `nextTick` 用 Promise + microtask 实现，等下一个 tick 同步执行
- `requestAnimationFrame` 跟浏览器渲染节奏对齐，约 16.7ms（60Hz）
- 动画场景选 `rAF`；状态变更后等 DOM 用 `nextTick`

## 真实场景（抽象）

拖动滑块更新进度条。三种路径：
- ① 同步设置：state 改了但 DOM 还没更新，读 `el.style.width` 是旧值
- ② `await nextTick()` 后读：新值
- ③ `requestAnimationFrame` 包动画：与浏览器帧同步

## 动手试

1. 点击「同步读 width」 — 看到读到的还是旧值
2. 点击「nextTick 后读」 — 拿到新值
3. 点击「rAF 动画」 — 进度条平滑增长

## 根因

Vue 响应式更新走 microtask 队列。`nextTick()` 返回 Promise，在 DOM patch 完成后 resolve。`rAF` 是浏览器提供的 hook，调用时机在样式 / 布局计算前。

## 修复 / 选型

- 改完状态立即要读 DOM：`await nextTick()`
- 跟手动画 / 高频视觉更新：`requestAnimationFrame`
- 二者混用：先 `nextTick()` 拿到正确 DOM 状态，再 `rAF` 启动下一帧

## 延伸阅读

- [nextTick API](https://vuejs.org/api/general.html#nexttick)
- [Vue 源码洞察：渲染器异步批处理：queueJob + flushJobs](_analysis/vue-source-insights.md#渲染器异步批处理queuejob--flushjobs) | `packages/runtime-core/src/scheduler.ts:62-67` 引用

## 小结

1. **现象**：改完 state 读 DOM 是旧值。
2. **复现**：对比同步 / nextTick 读取。
3. **修复**：按场景选 nextTick 或 rAF。
