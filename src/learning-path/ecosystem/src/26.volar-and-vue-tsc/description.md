> **版本**：Volar 2.x + vue-tsc 2.x | **状态**：stable | **源码**：`Vue Language Tools` | **延伸阅读**：[Vue 官方 · Volar](https://vuejs.org/guide/typescript/overview.html) | [Vue 官方 · IDE 支持](https://vuejs.org/guide/typescript/overview.html#ide-support)

# Volar 与 vue-tsc：.vue 文件的类型工作流

## 这是什么

Volar（VSCode 上的 **Vue - Official** 扩展）把 Vue 单文件组件当作"伪 TypeScript 文件"，提供：

- `<script setup>` 内 props / emits / slots 智能补全
- `<template>` 里插值表达式类型推导
- `<style scoped>` CSS Modules 类名提示
- 组件名自动 import、跨文件跳转

但 Volar **不负责命令行类型检查**——它只在 IDE 实时高亮错误。命令行 / CI 跑类型检查靠 `vue-tsc`：

```bash
# package.json scripts
{
  "scripts": {
    "type-check": "vue-tsc --noEmit",
    "type-check:watch": "vue-tsc --noEmit --watch"
  }
}
```

`vue-tsc` 本质是 `tsc` 加一层 `.vue` 文件预处理：把 `<script setup>`、`<template>` 拆成虚拟 `.ts` 文件，再用 `tsc` 类型检查。

### .vue 文件的 tsconfig 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "strict": true,
    "noImplicitAny": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": [
    "src/**/*",
    "src/**/*.vue",
    "env.d.ts"
  ],
  "vueCompilerOptions": {
    "skipTemplateCodegen": false
  }
}
```

关键点：

- `moduleResolution: "Bundler"` —— Vue 3 现代推荐配置（Vite、Webpack 5）
- `types: ["vite/client"]` —— 让 import `*.vue` 文件被识别为 Vue 组件
- `include` 必须包含 `*.vue` 才能被 vue-tsc 处理

## 工作流

| 阶段 | 工具 | 作用 |
| --- | --- | --- |
| 写代码 | Volar (VSCode) | 实时类型提示、跳转、补全 |
| 保存 | Prettier + ESLint | 格式 + 静态分析 |
| 提交 | lint-staged + husky | 阻止不合格代码进入 |
| CI | `vue-tsc --noEmit` + `vitest run` | 全量类型检查 + 单测 |
| 构建 | `vite build` | 编译产物 |

Volar 与 `vue-tsc` 必须版本匹配——Volar 2.x 对应 `vue-language-server` v2，`vue-tsc` v2.x 共享同一套 compiler pipeline。

## 实战场景

1. **大型项目 CI**：把 `vue-tsc --noEmit` 加到 GitHub Actions / GitLab CI，作为 PR 合并门禁。
2. **IDE 多端一致性**：JetBrains WebStorm 用自带的 Vue 模板语言工具；VSCode 用 Volar；脚本里用 vue-tsc——三者结果必须一致。
3. **monorepo 共享类型**：跨包导出 TS 类型时，vue-tsc 可以检查"组件 props 是否符合共享类型"。
4. **类型驱动重构**：定义好 SharedTypes 后，运行 vue-tsc 找到所有需要改的组件文件。

## 常见踩坑

- **Volar 与 vetur 不能并存**：Vue 2 时代的 vetur 与 Vue 3 的 Volar 会冲突；卸载 vetur 后才能用 Volar。
- **JSX 文件需要 `jsx: "preserve"`**：否则 tsc 会把 JSX 当 React 报错。
- **takeOverMode**：Volar 接管整个 TS Language Server，对大型项目性能更好；可用 `"vue.takeOverMode.enabled": true` 开启。
- **vue-tsc 2.0+ 速度**：内置 multi-phase compare 模式——首次扫描快，增量更快。VSCode 上有时仍建议用 Volar 单文件。
- **template type-check 与 script type-check 不同**：Volar 在 template 内的表达式类型推导独立于 script，要看到 template 类型错误必须把 Vue Language Server 升级到 2.x。
- **deprecated vue-template-compiler**：vue-tsc 2.0 已不再依赖 vue-template-compiler；旧配置可能报 missing dependency。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · IDE 支持](https://vuejs.org/guide/typescript/overview.html#ide-support) | Volar / vue-tsc 介绍 |
| [Vue Language Tools](https://github.com/vuejs/language-tools) | Volar 官方仓库 |
| [vue-tsc 文档](https://github.com/vuejs/language-tools/blob/master/packages/tsc/README.md) | 命令行用法 |
| [Volar 配置](https://vuejs.org/guide/typescript/overview.html#configuring-volar) | 高级配置 |
| [TypeScript 手册 · Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) | 大型项目分片编译 |