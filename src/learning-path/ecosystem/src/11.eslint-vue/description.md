> 版本: eslint-plugin-vue 9.x+ | RFC: — | 状态: stable | 概念: ESLint Vue 静态检查

# ESLint + Vue 项目

## 你会学到什么

TS + Vue 项目的统一 lint 链路：`@vue/eslint-config-typescript` 一行集成 vue + ts + prettier 风格规则，配合 `eslint-plugin-vue` 在模板 / 脚本 / 自定义块上做规则约束。

## 极简配置

```js
// eslint.config.js (flat config, ESLint 9+)
import vue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'

export default [
  ...vue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
]
```

老项目（ESLint 8 + .eslintrc）：

```js
// .eslintrc.cjs
module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript',
    'prettier',
  ],
}
```

## vetur vs volar

- **vetur**（已退役）：VS Code 早期 Vue 插件，靠 `vetur.validation`，TypeScript 支持弱
- **volar**（现役）：接管 Vue 3 + TSX + Volar 工具链，所有 lint / format / type-check 都基于它
- 现代项目 = Volar + ESLint 互补（Volar 负责类型 + 模板高亮，ESLint 负责风格）

## 动手试

右侧 REPL 演示典型 lint 错误：

- `<template>` 里变量未使用（vue/no-unused-vars）
- `props` 解构丢响应式
- `v-if` / `v-for` 同元素（vue/no-use-v-if-with-v-for）

> REPL 不直接跑 ESLint，演示规则样例 + 报错信息。

## 常见规则

| 规则 | 作用 |
|---|---|
| `vue/multi-word-component-names` | 组件名必须多单词（除 App / 顶级） |
| `vue/no-v-html` | 禁止 `v-html`（XSS 风险） |
| `vue/require-default-prop` | 强制 prop 有 default |
| `vue/component-api-style` | 强制 Composition API |
| `vue/no-unused-vars` | 模板未用变量 |
| `@typescript-eslint/no-explicit-any` | 禁用 `any` |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [`@vue/eslint-config-typescript`](https://github.com/vuejs/eslint-config-typescript) | 仓库 |
| [eslint-plugin-vue 规则索引](https://eslint.vuejs.org/rules/) | 全规则列表 |
| [Volar 替代 Vetur](https://vuejs.org/guide/typescript/overview.html) | IDE 配置 |
