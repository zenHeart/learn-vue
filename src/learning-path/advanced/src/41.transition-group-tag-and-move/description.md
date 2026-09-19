> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/components/TransitionGroup.ts` | **延伸阅读**：[Vue 官方 · TransitionGroup](https://vuejs.org/guide/built-ins/transition-group.html)

# TransitionGroup 完整 prop 与 FLIP 动画

## 这是什么

`<TransitionGroup>` 是 `<Transition>` 的列表版本：为 `v-for` 渲染的多个节点提供**进入 / 离开 / 移动**三类动画。它与普通 `<Transition>` 的关键差异：

1. **必须配合 `v-for` + `:key`**：TransitionGroup 通过 key 跟踪每个节点的「上一帧位置」，才能计算移动动画。
2. **支持 `tag` prop**：默认渲染 `<span>` 包裹每个子节点；可改成 `<ul>` / `<div>` 等真实语义化容器。
3. **FLIP 动画（First-Last-Invert-Play）**：依赖 `:move-class` 触发；Vue 内部算出 DOM 真实位移前后的 transform 矩阵，做反向动画。
4. **离开动画需要绝对定位**：因为节点消失时其它节点会立即重排，需要 `position: absolute` 让 leave 节点原地渐隐。

## 源码走读

```ts
// packages/runtime-core/src/components/TransitionGroup.ts (节选)
// TransitionGroup 内部：
// 1. 在 patch 前调用 getBoundingClientRect() 记录每个 key 的位置（First）
// 2. patch 完成后再调用一次（Last），计算 delta
// 3. 给「未删除」的节点加 transform: translate(dx, dy)（Invert）
// 4. 下一帧触发 transition: transform .3s 把它放回原位（Play）
applyTranslation(node, dx, dy)
nextFrame(() => {
  addTransitionClass(node, props.moveClass)
  node.style.transform = ''
})
```

## 完整 prop 列表

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `tag` | string | `'span'` | 容器标签；常用 `ul` / `div` |
| `name` | string | `'v'` | 过渡类名前缀，等同 `<Transition>` 的 name |
| `move-class` | string | — | FLIP 移动类名（默认从 `name` 推导 `name-move`） |
| `appear` | boolean | false | 首次渲染是否走 enter |
| `css` | boolean | true | 是否用 CSS class 模式 |
| `type` | 'transition' \| 'animation' | — | 决定何时算结束 |
| `duration` | number \| `{ enter, leave }` | — | 自定义时长 |

## FLIP 动画的关键 CSS

```css
.todo-move {
  transition: transform .35s cubic-bezier(.4, 0, .2, 1);
}
.todo-leave-active {
  /* 离开节点必须脱离文档流，避免其它节点立即补位 */
  position: absolute;
}
```

## 与 `v-for` 配合的实战模板

```vue
<TransitionGroup tag="ul" name="todo" class="todo-list">
  <li v-for="item in items" :key="item.id">
    {{ item.text }}
  </li>
</TransitionGroup>

<style>
.todo-enter-from { opacity: 0; transform: translateY(-12px); }
.todo-enter-active { transition: all .3s; }
.todo-leave-to { opacity: 0; transform: translateX(20px); }
.todo-leave-active { transition: all .3s; position: absolute; }
.todo-move { transition: transform .3s; }
</style>
```

## 实战场景

1. **可拖拽排序**：配合 vuedraggable / SortableJS，排序时节点平滑过渡。
2. **多选删除**：批量删除时其它选中项自动重新排列，配 move 动画。
3. **标签云 chip**：增删标签时 FLIP 让周围 chip 滑动到位。
4. **卡片网格重排**：响应式布局变化时（如窗口宽度变化），节点顺序重排需移动动画。

## 常见踩坑

- **没给 `position: absolute` 的 leave-active**：离开动画与周围节点重排冲突，看起来「抖了一下」。
- **`:key` 不稳定**：用 `index` 当 key 会导致 move 动画错乱（重排时所有节点都「离开再进入」）；必须用业务 id。
- **没有 `tag="ul"`**：默认包 `<span>` 不符合列表语义，且 list-style 失效。
- **`move-class` 写错类名**：Vue 默认从 `name` 派生 `name-move`，手动覆盖时三个 enter/leave/move 必须严格对应。
- **`will-change` 滥用**：大列表（>500 项）开启 transition 性能差，FLIP 测量耗时也高；考虑关闭移动动画或虚拟列表。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · TransitionGroup](https://vuejs.org/guide/built-ins/transition-group.html) | 完整 API 文档 |
| [Vue 源码 · TransitionGroup.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/TransitionGroup.ts) | FLIP 实现细节 |
| [Vue 源码 · v-memo 与 Transition](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vMemo.ts) | v-memo 节点不要套 transition |