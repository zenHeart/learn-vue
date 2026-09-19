# TransitionGroup + FLIP move class 完整原理

> 版本：Vue 3.x | 状态：stable | 源码：`packages/runtime-core/src/components/TransitionGroup.ts` | 延伸阅读：[Vue 官方：TransitionGroup](https://cn.vuejs.org/guide/built-ins/transition-group.html)

## 这是什么

`<TransitionGroup>` 是 `<Transition>` 的列表版：渲染一个元素集合（默认 `<span>`，通过 `tag` 改），并对每个变化（新增、移除、移动）应用过渡动画。

FLIP 动画由 Vue 自动处理：

1. **First**：记录当前各元素的 `boundingClientRect`；
2. **Last**：DOM 完成更新（位置变化后）；
3. **Invert**：计算新旧位置 delta，临时用 `transform: translate(dx, dy)` 倒回旧位置；
4. **Play**：用 transition 把 `transform` 从旧值过渡回 0（对应 `*-move` 类）。

## 关键 prop

| prop | 说明 |
|---|---|
| `tag` | 包裹元素；默认 `span` |
| `name` | 过渡类名前缀 |
| `move-class` | 自定义 move 过渡类名（默认 `name-move`） |
| `appear` | 首次渲染是否也播动画 |
| `css` | 是否监听 CSS 事件；`false` 表示完全靠 JS 钩子 |

## 源码走读

```ts
// packages/runtime-core/src/components/TransitionGroup.ts
// 内部用 hasCSSTransform 判断浏览器 transform 支持
// patch 完后调用 applyTranslation：在 nextFrame 中将 transform 复位
```

> 关键技巧：`applyTranslation` 通过 `will-change: transform` + `transition: transform 0.5s` 让浏览器自动插值。

## 实战场景

1. 列表项增删 / 重排的平滑动画；
2. 拖拽后元素归位；
3. 卡片轮播、瀑布流重排。

## 常见踩坑

- 必须为每个子元素设置 **`key`**，否则 Vue 无法追踪元素身份；
- 子元素必须支持 `transform` 动画（display: inline 不行——应改为 inline-block 或 block）；
- 若列表外层容器本身在 transition（`overflow: hidden` 切换），FLIP 会被裁切。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方：TransitionGroup](https://cn.vuejs.org/guide/built-ins/transition-group.html) | FLIP 原理 |
| [Vue 官方：TransitionGroup API](https://cn.vuejs.org/api/built-ins.html#transitiongroup) | prop 列表 |
| [Vue 源码：TransitionGroup.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/TransitionGroup.ts) | applyTranslation |