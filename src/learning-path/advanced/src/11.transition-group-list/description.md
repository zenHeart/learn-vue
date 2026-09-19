> 版本: Vue 3.x | 状态: stable

# TransitionGroup 列表动画

`<TransitionGroup>` 是 `<Transition>` 的列表版本，专门为 `v-for` 列表服务。它会在增删改时为每个元素应用 6 个阶段的 class，进入、离开、移动都能搭配 CSS 过渡。

## 这是什么

```vue
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">
    {{ item.text }}
  </li>
</TransitionGroup>
```

对应的 CSS：

```css
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(10px); }
.list-enter-active, .list-leave-active { transition: all .3s; }
.list-move { transition: transform .3s; }
```

`name` 决定了 class 前缀。Vue 自动在移动元素时施加 `list-move` class，配合 FLIP 动画让其它元素平滑滑动。

## Vue 怎么实现

- 入口：`packages/runtime-core/src/components/TransitionGroup.ts`
- 进入：`enter` / `enter-from` / `enter-active` / `enter-to`
- 离开：`leave` / `leave-from` / `leave-active` / `leave-to`
- 移动：`move`（FLIP：先记录 First 位置，渲染 Last 位置，倒推 Invert 偏移，最后 Play 回原位）

## 实战中什么时候用 / 什么时候不用

**用**：

- 列表增删 / 重排场景
- 表单动态增项

**不用**：

- 简单的淡入淡出——用 `<Transition>` 即可

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/built-ins/transition-group.html
- https://cn.vuejs.org/api/built-in-components.html#transitiongroup

## 常见踩坑

- 每个子节点必须有 `:key`
- 移动元素的容器不能带 overflow:hidden，否则 FLIP 会失效
- `tag="ul"` / `tag="p"` 等默认会创建外层元素；不需要时传 `tag="null"` 不渲染外层

## 延伸阅读

- https://cn.vuejs.org/guide/built-ins/transition-group.html
- https://cn.vuejs.org/api/built-in-components.html#transitiongroup
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/TransitionGroup.ts
- https://aerotwist.com/blog/flip-your-animations/
- https://cn.vuejs.org/guide/built-ins/transition.html
- [Vue 源码洞察：TransitionGroup 的 key 复用与 move-class 触发](_analysis/vue-source-insights.md#transitiongroup-的-key-复用与-move-class-触发) | `packages/runtime-core/src/components/TransitionGroup.ts` 引用
