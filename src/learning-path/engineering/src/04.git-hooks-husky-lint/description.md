> 版本: Husky 9 + lint-staged 15 | RFC: — | 状态: stable | 概念: 提交前自动检查

# Husky + lint-staged 提交前检查

## 你会学到什么

- 用 `husky` 装 git hooks
- `lint-staged` 只对暂存文件跑 lint + format
- 用 `commitlint` 校验 commit message

## 关键配置

```json
// package.json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{vue,ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.md": ["prettier --write"]
  }
}
```

```sh
# .husky/pre-commit
pnpm lint-staged

# .husky/commit-msg
pnpm commitlint --edit "$1"
```

## commitlint config

```js
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'docs', 'test', 'chore']],
    'subject-max-length': [2, 'always', 72],
  },
}
```

## 动手试

1. 看下方 hook 流程图
2. 切换「跳过 lint-staged」观察是否所有变更都进 CI

## 修复 / 选型

- `simple-git-hooks`：零依赖的轻量替代
- `lefthook`：Go 实现，比 husky 快
- monorepo：在根 `package.json` 配 lint-staged

## 延伸阅读

- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/lint-staged/lint-staged)

## 小结

1. **场景**：拦截低质量提交。
2. **配置**：husky + lint-staged + commitlint。
3. **维护**：hook 脚本失败时给出可读错误。
