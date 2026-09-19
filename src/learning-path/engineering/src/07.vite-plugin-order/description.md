> 版本: Vite 5 | RFC: — | 状态: stable | 概念: 构建插件顺序

# Vite 插件顺序与冲突排查

## 你会学到什么

- 常见 Vue 3 项目插件顺序：`Vue` → `Svg` → `Components` → `AutoImport` → `Pages` → `Compress` → `Visualizer`
- 为什么顺序敏感：transform 阶段插件按数组顺序串联
- 冲突时的排查：`vite --debug plugin` + 删除法

## 常见配置

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import components from 'unplugin-vue-components/vite'
import autoImport from 'unplugin-auto-import/vite'
import vuePages from 'vite-plugin-pages'
import compress from 'vite-plugin-compression'
import visualizer from 'rollup-plugin-visualizer'

export default {
  plugins: [
    vue(),
    svgLoader(),
    components({ dts: true }),
    autoImport({ imports: ['vue', 'vue-router'] }),
    vuePages(),
    compress({ algorithm: 'gzip' }),
    visualizer({ open: false, gzipSize: true }),
  ],
}
```

## 顺序原则

| 阶段 | 原则 |
|------|------|
| `enforce: 'pre'` | 必须最早（如 vue、autoImport 的预扫描） |
| 默认 | 多数转换插件 |
| `enforce: 'post'` | 最后跑（如 compress、visualizer） |
| Rollup 钩子 | 决定实际执行顺序 |

## 常见冲突

| 冲突 | 解决 |
|------|------|
| `vue` 与自定义 `<template>` 解析 | 把自定义插件放 vue 之后 |
| AutoImport 与显式 import 重复 | `eslint-disable` 或 `imports.dts` |
| Components 全局注册与显式 import 冲突 | 仅在 scripts 不写 import |

## 动手试

1. 看下方插件顺序展示
2. 拖动插件位置观察提示「是否合法」
3. 切换「打开 visualizer」

## 修复 / 选型

- 顺序原则：被依赖方在前
- 调试：`vite build --debug plugin`
- 必要时拆 config 到不同环境

## 延伸阅读

- [Vite Plugin Pipeline](https://vite.dev/guide/api-plugin.html#plugin-ordering)

## 小结

1. **场景**：插件冲突 / 顺序错误。
2. **原则**：pre → 默认 → post。
3. **排查**：`--debug plugin` + 删除法。
