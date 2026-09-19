> 版本: unplugin-auto-import 0.x+ | RFC: — | 状态: stable | 概念: unplugin-auto-import 自动 import

# unplugin-auto-import 自动引入

## 你会学到什么

`unplugin-auto-import/vite` 跟 `unplugin-vue-components` 是孪生兄弟：一个管**组件**自动注册，一个管**API**自动 import。打开后，写 `<script setup>` 不用再 `import { ref, computed, watch } from 'vue'`——插件扫到 `ref(` 自动注入 import。

## 配置

```ts
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core'],
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: { enabled: true }, // 生成 .eslintrc-auto-import.json
    }),
  ],
})
```

## 配套 ESLint

开启 `eslintrc: { enabled: true }` 后插件生成 `.eslintrc-auto-import.json`，在 `.eslintrc` extends 即可：

```js
{ "extends": ["./.eslintrc-auto-import.json"] }
```

否则 ESLint 会报 `ref is not defined`。

## 与 unplugin-vue-components 协同

```ts
plugins: [
  AutoImport({ /* ... */ }),
  Components({ resolvers: [ElementPlusResolver()], dts: true }),
]
```

两者都用 `dts` 生成类型文件，确保 `tsconfig.json` 包含。

## 动手试

右侧 REPL 演示自动 import 的 import 语句长什么样。

## 常见坑

| 现象 | 原因 | 修复 |
|---|---|---|
| ESLint 报未定义变量 | 没开 `eslintrc.enabled` | 改配置 + 重启 vite |
| TypeScript 报红 | `auto-imports.d.ts` 没被 tsconfig 包含 | 加 `"include": ["src/**/*.d.ts"]` |
| 第三方库 API 没自动 import | `imports` 数组里没列 | 写自定义 preset 或在 `imports` 加 |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [unplugin-auto-import](https://github.com/antfu/unplugin-auto-import) | 仓库 |
| [Vue 3 preset](https://github.com/antfu/unplugin-auto-import#imports) | 内置列表 |
| [与 ESLint 集成](https://github.com/antfu/unplugin-auto-import#eslint) | 配置 |
