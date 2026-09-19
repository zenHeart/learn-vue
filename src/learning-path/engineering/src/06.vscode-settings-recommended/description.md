> 版本: VSCode 1.85+ | RFC: — | 状态: stable | 概念: 编辑器集成

# VSCode 推荐配置

## 你会学到什么

- Volar（Vue Language Features）取代 Vetur
- ESLint + Prettier + Stylelint + EditorConfig 四件套集成
- 保存时自动格式化

## 关键配置

```jsonc
// .vscode/settings.json
{
  // Vue
  "vue.server.hybridMode": true,

  // 编辑器
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  },

  // 文件关联
  "files.associations": {
    "*.vue": "vue"
  },

  // ESLint
  "eslint.validate": [
    "javascript",
    "typescript",
    "vue"
  ],

  // Prettier
  "prettier.singleQuote": true,
  "prettier.semi": false,

  // Stylelint
  "stylelint.validate": ["css", "scss", "vue"],

  // 排除
  "files.exclude": {
    "**/dist": true,
    "**/.vite": true
  }
}
```

## 推荐扩展

```jsonc
// .vscode/extensions.json
{
  "recommendations": [
    "Vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint",
    "EditorConfig.EditorConfig",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 动手试

1. 看下方配置分组
2. 切换「formatOnSave」观察 ESLint 行为差异

## 修复 / 选型

- 团队统一：在仓库提交 `.vscode/settings.json`
- 个人配置放 `.vscode/settings.local.json`（gitignored）
- Volar takeover：禁用 JS / TS 内置语言服务避免冲突

## 延伸阅读

- [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [EditorConfig](https://editorconfig.org/)

## 小结

1. **场景**：团队编辑器体验一致。
2. **配置**：settings.json + extensions.json。
3. **维护**：禁用过时的 Vetur。
