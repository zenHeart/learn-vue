# v-memo / v-pre / v-once / v-cloak 编译时优化指令 {#v-memo-and-directives}

> **版本**：Vue 3.2+ | **状态**：stable | **源码**：`packages/compiler-core/src/transforms/vMemo.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/built-in-directives.html#v-memo)

四个「跳过无意义重渲染」的编译时指令：

- **`v-memo="[dep1, dep2, ...]"`**（3.2+）：仅当依赖数组里的值都变化时才重新渲染节点；与 `v-for :key` 配合可以做细粒度剪枝。
- **`v-pre`**：跳过该节点及其子节点的编译，原样输出 `{{ }}`。
- **`v-once`**：节点只渲染一次，之后任何响应式依赖更新都不会重渲染。
- **`v-cloak`**：编译期属性（保留在 DOM 上直到组件挂载完成），配合 CSS `[v-cloak] { display: none }` 在编译完前隐藏原始 mustache。

## 这是什么 {#what}

```vue
<!-- v-memo：依赖数组内全部相等就跳过 vnode patch -->
<div v-for="row in rows" :key="row.id" v-memo="[row.value, selectedId === row.id]">
  {{ row.label }}: {{ row.value * 2 }}
</div>

<!-- v-pre：原样输出，连插值语法都不会被编译 -->
<span v-pre>{{ 这里的内容不会被编译 }}</span>

<!-- v-once：节点只渲染一次 -->
<span v-once>登录时间: {{ loginTime }}</span>

<!-- v-cloak：配合 CSS 隐藏未编译的 mustache -->
<style>[v-cloak] { display: none }</style>
<div v-cloak>{{ msg }}</div>
```

## 源码走读 {#source}

```ts
// packages/compiler-core/src/transforms/vMemo.ts
// v-memo 编译后大致等价于：
// _cache[vnode.key] && shallowEqual(_cache[vnode.key].memo, deps)  -> 复用旧 vnode
// 否则 patch 并更新 _cache[].memo

// v-once: 编译器把节点包成 _cache[...] = vnode，下次跳过 _createVNode
// v-pre:  跳过该节点的 transform 流程
// v-cloak: 不在编译期清除，留给 CSS 隐藏
```

关键事实：

- `v-memo` 只对**完整 vnode 的 patch 阶段**生效，节点的 setup / computed 仍会照常订阅 —— 它优化的是「避免无意义 DOM diff」，不是「跳过响应式追踪」。
- `v-once` 同样只在 patch 层优化；setup 里的 watchEffect 仍会跑。
- `v-memo` 必须放在 `v-for` 同一节点上才有意义（v-for 通过 :key 复用子节点，v-memo 进一步剪枝）。

## 实战场景 {#production}

1. **静态文本节点**：`v-pre` 渲染模板片段、Vue 文档示例、Markdown 渲染后的 HTML 段。
2. **登录时间 / 一次性展示**：`v-once` 在用户详情页展示「当前时间 X.X 天前」这类首次计算后永远不变的展示。
3. **大列表细粒度剪枝**：10k 行表格，但「只关心某几列变化」 —— `v-memo="[row.value]"` 跳掉其它列的 diff。
4. **首屏防闪烁**：`v-cloak` + CSS 在 `<style>` 里写 `[v-cloak]{display:none}` —— 比 `<template v-if="mounted">` 更轻。

## 常见踩坑 {#pitfalls}

- **`v-memo` 数组里放非响应式值**：常量不会触发更新；同时不要把 ref 直接放进去（应拿 `value`）。
- **不要把整个 row 塞进 memo**：对象引用每次 `rows.value.push(...)` 都变，会破坏 memo；用最小依赖集（几个原子字段）。
- **不要在 v-memo 节点上使用 transition**：`v-memo` 跳过 vnode patch，`<transition>` 钩子不会被触发。
- **v-pre 在子节点编译**：跳过的是该节点和所有子节点的编译，子节点里的指令不会执行。
- **v-cloak 与 SSR**：SSR 渲染的 HTML 不会带 `v-cloak` 属性 —— 它只对 CSR 首屏有意义。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/built-in-directives.html#v-memo) | API 文档 |
| [Vue 官方](https://vuejs.org/api/built-in-directives.html#v-once) | v-once 文档 |
| [Vue 官方](https://vuejs.org/api/built-in-directives.html#v-pre) | v-pre 文档 |
| [Vue 源码 · vMemo.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vMemo.ts) | v-memo 编译实现 |
| [Vue 源码 · vOnce.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vOnce.ts) | v-once 编译实现 |