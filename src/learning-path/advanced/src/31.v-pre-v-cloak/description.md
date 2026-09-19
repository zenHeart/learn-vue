# v-pre / v-cloak：编译期与首屏防闪烁 {#v-pre-v-cloak}

> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/compiler-core/src/transforms/vPre.ts`、`packages/runtime-core/src/directives/vCloak.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/built-in-directives.html#v-pre)

两个与编译/挂载时序强相关的指令：

- **`v-pre`**：跳过该节点及其子节点的编译 —— 原样输出 `{{ }}`、不执行任何指令。
- **`v-cloak`**：编译期在节点上保留属性，组件挂载完成后才移除 —— 配合 CSS `[v-cloak] { display: none }` 在编译完前隐藏原始 mustache。

> 配套：[`26.v-memo-and-directives`](#) 已包含 `v-memo` / `v-once`；本 demo 专注于 `v-pre` 与 `v-cloak` 的深度细节。

## 这是什么 {#what}

```vue
<!-- v-pre：原样输出，连插值语法都不会被编译 -->
<span v-pre>{{ 这里的内容不会被编译 }}</span>

<!-- v-cloak：配合 CSS 隐藏未编译的 mustache -->
<style>
  [v-cloak] { display: none }
</style>
<div v-cloak>{{ msg }}</div>
```

## 源码走读 {#source}

```ts
// packages/compiler-core/src/transforms/vPre.ts
// 命中 v-pre 节点：跳过所有 transform 流程，子节点照旧
// 输出形式：原样保留 mustache 字符串

// packages/runtime-core/src/directives/vCloak.ts
// 不在编译期清除；mounted 后由 patched flag 自动卸载
export const vCloak: Directive = {
  beforeMount(el) {
    // 保留 v-cloak 属性直到首次 patch 完成
  },
}
```

关键事实：

- **`v-pre` 性能价值**：跳过节点 transform + 子节点 patch 优化 —— 适合静态内容（Markdown 渲染、HTML 片段、API 文档示例）。
- **`v-pre` 不递归编译**：节点和**子节点**都不会被编译，子节点里的任何指令都失效。
- **`v-cloak` 仅对 CSR 有意义**：SSR 渲染出来的 HTML 不会带 `v-cloak` 属性，SSR 路径不存在编译前闪烁问题。
- **`v-cloak` 不会编译期删除**：属性保留在节点上直到组件完成首次 patch，再通过属性 diff 卸载。

## 实战场景 {#production}

1. **静态文档片段**：`v-pre` 渲染 Vue 教程里"这段代码长这样"的代码示例。
2. **CSS-in-JS 模板字符串**：动态字符串里嵌了 `{{ }}`，外层包 `<pre v-pre>` 避免被 Vue 编译。
3. **首屏防闪烁**：SPA 加载大组件、慢网络场景下，`<div v-cloak>` + 全局 CSS 隐藏未编译 mustache。
4. **替代 `<template v-if="mounted">`**：避免引入额外 ref / mounted 状态机。

## 常见踩坑 {#pitfalls}

- **`v-pre` 节点内指令失效**：子节点里的 `v-if` / `v-on` 都不会执行 —— 不要写 `<div v-pre><span v-if="x"></span></div>`。
- **`v-pre` 与 SSR**：SSR 渲染的 HTML 里 mustaches 已经渲染完，`v-pre` 仅影响模板编译，对 SSR 输出无意义。
- **`v-cloak` CSS 必须全局**：scoped CSS 在组件挂载前可能未生效，需写 `:deep([v-cloak]) { display: none }` 或全局 CSS。
- **`v-cloak` 不阻止 mounted 闪烁**：仅隐藏首次 patch 前的原始 mustache，组件挂载后属性消失 —— 配合 `<Suspense>` 处理异步子组件时仍可能闪烁。
- **`v-pre` 与组件嵌套**：组件标签本身的 props/事件仍正常编译（仅节点本身及其直接子节点跳过编译）。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/built-in-directives.html#v-pre) | v-pre 文档 |
| [Vue 官方](https://vuejs.org/api/built-in-directives.html#v-cloak) | v-cloak 文档 |
| [Vue 源码 · vPre.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vPre.ts) | 编译期实现 |
| [Vue 源码 · vCloak.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/directives/vCloak.ts) | 运行时 directive |
| [Vue 官方 · v-cloak 教程](https://vuejs.org/examples/#v-cloak) | 官方示例 |
