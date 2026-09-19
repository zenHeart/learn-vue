# Transition mode 与 appear 切换动画 {#transition-modes}

> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/components/BaseTransition.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/guide/built-ins/transition.html#transition-modes)

`<Transition>` 组件控制单元素 / 组件的进入与离开动画。`mode` 属性控制两个动画的相对时序，`appear` 让首次挂载也跑进入动画。

| mode | 时序 |
|---|---|
| `default`（同步） | 进入与离开动画同时进行（重叠） |
| `out-in` | 离开动画先结束，再触发进入动画 |
| `in-out` | 进入动画先完成，再触发离开动画（注意：进入元素先插入） |

## 这是什么 {#what}

```vue
<!-- out-in：先离开，再进入（最常用） -->
<Transition mode="out-in" name="fade">
  <div v-if="show" key="a">A</div>
  <div v-else key="b">B</div>
</Transition>

<!-- in-out：先进入（已存在），再离开（注意：进入元素先插入） -->
<Transition mode="in-out" name="slide">
  <div v-if="show" key="x">X</div>
  <div v-else key="y">Y</div>
</Transition>

<!-- appear：首次挂载也跑进入动画 -->
<Transition appear name="bounce">
  <div v-if="show">Hello</div>
</Transition>
```

## 源码走读 {#source}

```ts
// packages/runtime-core/src/components/BaseTransition.ts
// 关键时序：mode === 'out-in' 时
//   1) 旧元素触发 leave 钩子
//   2) onAfterLeave → unmount 旧元素 → 触发新元素 enter
// mode === 'in-out' 时：
//   1) 新元素先 mount（位置变化但旧元素仍可见）
//   2) 同时触发 enter
//   3) enter 完成后 → 触发旧元素 leave
```

关键事实：

- **同步 mode 不传**：`mode` 不传或 `default` 时进入与离开动画同时进行 —— 适合 FAB 切换图标、淡入淡出。
- **`out-in` 最常用**：避免两个元素同时出现在屏幕，避免布局抖动。
- **`in-out` 适合「先放大新内容，再缩小旧内容」**：但需注意新元素先占据位置。
- **`appear` 仅首次挂载生效**：配合 `name` 走相同的 `*-enter-from` 等 class；可单独定义 `*-enter-` 系列（不冲突时复用）。

## 实战场景 {#production}

1. **路由切换**：`<RouterView>` 内层用 `<Transition mode="out-in">` —— 离开完成才进入下一路由。
2. **模态框 / Drawer**：默认 mode 同时进行 + opacity + transform 实现交叉淡入。
3. **首次加载引导**：`appear` 让首次渲染元素带动画（如列表项依次进入）。
4. **Tab 切换**：`<Transition mode="out-in">` + 配合 `:key` 强制重建 DOM。

## 常见踩坑 {#pitfalls}

- **`mode` 与 `v-show` 冲突**：`v-show` 时元素始终存在，`<Transition>` 不会触发；只在 `v-if` / 组件切换时有效。
- **必须 `:key`**：mode 切换时新旧元素需要不同 key，否则会被视为同一节点复用。
- **`in-out` 与 `appear` 视觉错位**：`in-out` 先进入新元素（位置抢占），旧元素离开会让布局突变。
- **动态组件与 `<component :is>`**：`<Transition>` 包裹动态组件同样适用 mode；但组件必须用 `:key` 区分。
- **CSS transition 与 JS 钩子冲突**：自定义 `@before-enter` / `@enter` JS 钩子时，mode 仍生效，但 leave 与 enter 钩子的执行顺序随 mode 变。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/guide/built-ins/transition.html) | Transition 文档 |
| [Vue 官方 · transition-modes](https://vuejs.org/guide/built-ins/transition.html#transition-modes) | mode 章节 |
| [Vue 源码 · BaseTransition.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/BaseTransition.ts) | 实现 |
| [Vue 官方 · appear](https://vuejs.org/guide/built-ins/transition.html#appear) | appear 文档 |
| [CSS transition 规范](https://developer.mozilla.org/docs/Web/CSS/CSS_animations/Using_CSS_animations) | transition 基础 |
