> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/components/TransitionGroup.ts:300-360`

# `<TransitionGroup>` 的 `tag` 与 `appear`

## 这是什么

`<TransitionGroup>` 在两个能力上比 `<Transition>` 走得更远：

- **`tag`**：指定外层容器元素。默认渲染为 `<span>`（与 `<Transition>` 相同），但列表场景通常要 `<ul>`、`<div>`、`<section>` 等。
- **`appear`**：列表**首次渲染**时也给每个元素加进入过渡。默认 `appear="false"`——首屏直接显示，不动画。打开后，首屏挂载会用与后续 enter 完全一致的 6 阶段 class（`xxx-enter-from → xxx-enter-active → xxx-enter-to`）。

```vue
<!-- 不写 tag：渲染为 <span> -->
<TransitionGroup>
  <span v-for="x in list" :key="x.id">{{ x.text }}</span>
</TransitionGroup>

<!-- tag="ul"：渲染为 <ul> -->
<TransitionGroup tag="ul" class="list">
  <li v-for="x in list" :key="x.id">{{ x.text }}</li>
</TransitionGroup>

<!-- appear：首屏也动画 -->
<TransitionGroup appear name="fade" tag="ul">
  <li v-for="x in list" :key="x.id">{{ x.text }}</li>
</TransitionGroup>
```

`appear` 也接受对象形式的 JavaScript hooks：

```vue
<TransitionGroup
  appear
  :appear-from-class="..."
  :appear-active-class="..."
  :appear-to-class="..."
  @before-appear="el => ..."
  @appear="el => ..."
  @after-appear="el => ..."
>
```

## 源码走读

```ts
// packages/runtime-core/src/components/TransitionGroup.ts
const TransitionGroupImpl = {
  props: {
    ...TransitionPropsValidators,
    tag: String,                          // 外层容器 tag
    moveClass: String,
  },
  setup(props, { slots }) {
    // ...
    return () => {
      const children = slots.default
      const tag = props.tag || 'span'
      return createElement(tag, null, children)   // tag 决定 createElement 类型
    }
  },
}

// appear 在 TransitionPropsValidators 中定义：
appear: Boolean,         // 是否对首次渲染应用 enter 逻辑
```

`TransitionGroup` 在内部把每个子 vnode 当作「要过 transition 的元素」处理；对 `appear` 而言，它遍历 children 时，如果 `appear=true` 且节点是首次出现，就走 `callPendingCbs` + `transition.enter()` 流程。

## 实战场景

1. **首屏列表入场动画**：商品列表、卡片网格在加载完成时整体淡入；比手动 `setTimeout` + `v-show` 简洁。
2. **`tag="section"` 改换语义结构**：外层不用 `<span>` 嵌套，改成 `<ul>` / `<div>`，SEO 和样式都更自然。
3. **SSR 兼容**：服务端不会执行 transition；`appear` 只在 client mount 时跑，不影响 hydration mismatch。
4. **配合 `move-class`**：列表移动（FLIP）动画独立配置 class 名，与 enter/leave 不冲突。

## 常见踩坑

- **`appear` 必须配 CSS**：仅写 `appear` 不写 `.xxx-enter-from` 不会有动画；要保证 `.xxx-enter-active { transition: ... }` 也能命中。
- **`appear` 不触发 leave / move**：仅作用于首次 enter；后续增删仍走正常 leave / move。
- **`tag="null"`（v3.3+）**：传字符串 `'null'` 不渲染外层元素（直接 fragment）；不要写 `:tag="null"`（会被当成 null 字符串）。
- **避免给外层容器加 `overflow: hidden`**：FLIP 计算需要可测量位置；裁剪会失效。
- **`appear` 与 `<Transition>` 嵌套**：外层 `<Transition>` 已经做了 appear，内部组的 `appear` 不会被感知；只在最外层声明。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://cn.vuejs.org/guide/built-ins/transition-group.html) | TransitionGroup 完整用法 |
| [Vue 官方](https://cn.vuejs.org/api/built-in-components.html#transitiongroup) | props / events |
| [Vue 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/TransitionGroup.ts) | tag / appear 内部处理 |
| [FLIP 原理](https://aerotwist.com/blog/flip-your-animations/) | First / Last / Invert / Play |