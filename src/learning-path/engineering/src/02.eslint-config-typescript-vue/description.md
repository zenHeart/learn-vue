> 版本: ESLint 9 | RFC: — | 状态: stable | 概念: flat config + Vue + TS

# ESLint flat config + Vue + TypeScript

## 你会学到什么

- 用 `eslint.config.js`（flat config）取代旧 `.eslintrc`
- 接入 `@vue/eslint-config-typescript`
- 关键 rules 选型：`vue/multi-word-component-names`、`@typescript-eslint/no-explicit-any`

## 关键配置

```js
// eslint.config.js
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import ts from '@vue/eslint-config-typescript'

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  ...ts(),
  {
    rules: {
      'vue/multi-word-component-names': 'error',
      'vue/component-api-style': ['error', ['script-setup']],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
```

## 旧 config 差异

| 维度 | 旧 (.eslintrc) | flat (eslint.config.js) |
|------|----------------|--------------------------|
| 格式 | 嵌套对象 | 扁平数组 |
| 插件 | string 名 | 显式 import |
| 优先级 | 后定义覆盖 | 显式覆盖 |
| 工具链兼容 | 部分新工具不兼容 | 默认 |

## 动手试

1. 看下方 rules 列表与说明
2. 切换「启用 no-explicit-any」观察规则数量

## 修复 / 选型

- 旧项目迁移：保留 `extends` + 加 `FlatCompat` 适配
- 新项目直接 flat
- VSCode 集成：ESLint 扩展读 `eslint.config.js`

## 延伸阅读

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [@vue/eslint-config-typescript](https://github.com/vuejs/eslint-config-typescript)

## 小结

1. **场景**：统一 Vue + TS 代码风格。
2. **配置**：flat config 一份搞定。
3. **选型**：新项目 flat，旧项目渐进迁移。
