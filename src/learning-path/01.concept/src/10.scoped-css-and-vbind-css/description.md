# SFC `<style scoped>` 与 `v-bind()` in CSS

> 版本：Vue 3.x | 状态：stable | 源码：`packages/compiler-sfc/src/style/cssVars.ts` `stylePluginScoped.ts` | 延伸阅读：[Vue 官方：SFC 样式](https://cn.vuejs.org/api/sfc-css-features.html)

## 这是什么

`<style scoped>` 让样式**只作用于当前组件**：编译时 Vue 给每个元素加 `data-v-xxx` 属性，并把选择器重写为 `.cls[data-v-xxx]`。`<style module>` 则把 CSS 当作 JS 模块导出，通过 `useCssModule()` 在 `<script setup>` 里读取。

`v-bind()` in CSS（Vue 3.2+）允许**把响应式状态写进 CSS 变量**：

```vue
<style scoped>
.color { color: v-bind(color); }
</style>
```

编译器把 `v-bind(color)` 重写为 `var(--xxx-color)`，并在运行时通过 `setProperty` 把 ref 值同步进去。

## 源码走读

```ts
// packages/compiler-sfc/src/style/stylePluginScoped.ts
// 选择器末尾追加 [data-v-xxx]
selectorTransformer(selector) { ... }

// packages/compiler-sfc/src/style/cssVars.ts
// v-bind(color) -> var(--xxx-color)
genCssVars(cssVars) { ... }
```

## 实战场景

1. 写组件时**默认** `<style scoped>`：避免类名泄漏。
2. 主题切换：响应式 CSS 变量驱动整棵子树的颜色 / 尺寸变化。
3. 与 `data-allow-mismatch`（SSR 水合）配合可避免 hydration mismatch。

## 常见踩坑

- scoped CSS 会把选择器加 `data-v`，**对子组件根元素不生效**（子组件作用域独立）；需 `:deep()` 才能穿透。
- `v-bind()` 仅支持**当前组件**内的响应式变量；不会自动响应 prop 变化——必须用 computed 派生。
- 嵌套的 `v-bind()` 在某些边缘场景会重复重写，源码提供 `getCssVars` 缓存。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方：scoped CSS](https://cn.vuejs.org/api/sfc-css-features.html#scoped-css) | 数据属性注入 |
| [Vue 官方：v-bind() in CSS](https://cn.vuejs.org/api/sfc-css-features.html#v-bind-in-css) | 状态驱动样式 |
| [Vue 官方：CSS Modules](https://cn.vuejs.org/api/sfc-css-features.html#css-modules) | `useCssModule` |
| [Vue 源码：stylePluginScoped.ts](https://github.com/vuejs/core/blob/main/packages/compiler-sfc/src/style/stylePluginScoped.ts) | scoped 改写 |