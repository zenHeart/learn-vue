> 版本: Vue 2.7+ | RFC: — | 状态: legacy | 概念: Composition API / 状态复用

# Vue 2.7 组合式 API：自定义 composable 复用

Vue 2.7 通过 `@vue/composition-api` 移植了 Vue 3 的组合式 API。本 demo 把「页码状态 + 是否超过阈值」抽到 `usePage()` 中，并在两个组件实例上复用。

## 你会学到什么

- 自定义 composable 函数返回 reactive 状态与方法。
- 多次调用同一 composable 拿到独立闭包，互不干扰。
- `<script setup>` 不支持 Vue 2，仍需使用 `export default { setup() }`。

## 动手试

1. 点击两个按钮观察两个独立的 `pageInfo`，互不影响。
2. 修改 `usePage.js` 中的 `INTI.NUM` 初始值，再刷新页面查看差异。
3. 尝试在 setup 外调用 `usePage()`：会因缺少 effect scope 报错。

## 关键陷阱

- Vue 2.7 不支持 `<script setup>` 与 `@vue/reactivity` 的部分 API。
- 同一 composable 多次调用要确保状态隔离，否则会相互覆盖。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 2.7 release notes](https://blog.vuejs.org/posts/vue-2-7-naruto.html) | 2.7 引入 Composition API 的细节 |
| [Composition API RFC](https://github.com/vuejs/rfcs/discussions/26) | Vue 3 Composition API 提案 |