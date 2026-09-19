---
title: VitePress    
tags: vitepress docs site      
birth: 2026-09-19      
modified: 2026-09-19      
---

VitePress 配置
===

> 本节不重复 VitePress 官方文档的入门，而是实战视角：站在「接手别人的 VitePress 站点怎么改」的入口，把 nav / sidebar / 自定义主题 / 自定义组件的链路一次性串起来。本项目自身就用了 `@vue/theme`，可以直接对照 `src/.vitepress/` 配置。配套的可交互 demo 见 [`/learning-path/ecosystem/#03.vitepress-theme`](/learning-path/ecosystem/#03.vitepress-theme)。

---

## 整体结构

```
.vitepress/
├── config.ts            # 主配置（站点元数据 + nav + sidebar）
├── theme/
│   ├── index.ts         # 主题入口，注册 layout / 全局组件
│   ├── components/      # 自定义组件（@theme 别名指向这里）
│   ├── layouts/         # 自定义 layout
│   └── styles/          # 全局样式
└── public/              # 静态资源（被原样拷贝到站点根）
```

Markdown 内容放在 `src/` 下任意位置，按目录组织导航。

## 站点元数据

```ts
// .vitepress/config.ts
export default defineConfig({
  title: 'Vue Learning Path',
  lang: 'en-US',
  description: 'Deep Learn Vue Note',
  srcDir: 'src',
  srcExclude: ['learning-path/**/description.md'], // 不暴露 demo 步骤文件
  ignoreDeadLinks: true,
  sitemap: { hostname: 'https://example.com/' },
})
```

| 字段 | 作用 |
|---|---|
| `srcDir` | 内容根目录（默认 `.`) |
| `srcExclude` | **必须**排除 `learning-path/**/description.md`，否则 sidebar 会引入大量 demo 步骤 |
| `ignoreDeadLinks` | 调试期用 true，发布前改成 false 验链接 |
| `sitemap.hostname` | SEO 用 |

## nav 与 sidebar

### nav（顶部横栏）

```ts
const nav: ThemeConfig['nav'] = [
  { text: 'Docs', activeMatch: '^/docs/', link: '/docs/' },
  { text: 'Learning Path', activeMatch: '^/learning-path/', link: '/learning-path/' }
]
```

`activeMatch` 用正则，让二级路径也能高亮。

### sidebar（左侧目录）

VitePress 支持两种模式：

**手动写死**：

```ts
themeConfig: {
  sidebar: {
    '/guide/': [
      { text: '介绍', link: '/guide/intro' },
      { text: '快速开始', link: '/guide/start' },
    ]
  }
}
```

**自动扫描（推荐）**：本项目用 `sidebar-generator.ts` 扫描 `src/learning-path/*/src` 和 `src/docs/*`，按目录结构自动生成。**新增 `src/learning-path/ecosystem/` 后无需任何改动，sidebar 自动出现**。

## 自定义主题

### 最小继承

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import MyLayout from './layouts/MyLayout.vue'

export default {
  extends: DefaultTheme,
  Layout: MyLayout, // 完全替换默认 layout
}
```

### 只想扩展不想替换

不写 `Layout` 字段，而是用 `enhanceApp`：

```ts
export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    app.component('MyBadge', MyBadge)
    app.directive('focus', focusDirective)
  }
}
```

这样默认 layout 还在，但你注册的全局组件 / 指令在所有页面生效。

### 用 `@theme` 别名引用自定义组件

```md
<!-- 在 markdown 里 -->
<MyBadge text="新" />
```

VitePress 编译时会去找 `.vitepress/theme/components/MyBadge.vue`。

## 本项目 `@vue/theme` 经验

本仓库用 `@vue/theme`（Vue 官方主题），关键差异：

1. **从 `@vue/theme` 导入类型**：`import type { Config as ThemeConfig } from '@vue/theme'`
2. **`enhanceApp({ siteConfig })`**：参数名是 `siteConfig`（不是 `siteData`）
3. **`defineConfig({...})`** 类型由 `@vue/theme` 提供

详见 `.vitepress/config.ts`。

## 常见坑

| 现象 | 原因 | 修复 |
|---|---|---|
| 自定义组件不显示 | 没注册 + 没在 `theme/components` 下 | 移动文件 + 在 `enhanceApp` 注册 |
| sidebar 收不到新加的路径 | 走的是「手写 sidebar」模式 | 改用 `sidebar-generator.ts` 或手动补条目 |
| `vitepress build` 提示死链 | 链接写错或真删了 | 用 `ignoreDeadLinks` 临时跳过 |
| `srcExclude` 写错导致 demo 内容泄漏 | 通配符不匹配 | 显式列出：`['learning-path/**/description.md']` |
| 主题类型报错 | `@vue/theme` 未装 | `pnpm add -D @vue/theme` |

## 与 Vite 插件协作

VitePress 内部跑的就是 Vite。在 `.vitepress/config.ts` 里：

```ts
export default defineConfig({
  vite: {
    plugins: [myCustomPlugin()],
    optimizeDeps: { exclude: [...] }
  }
})
```

注意 VitePress **不会**自动启用 `@vitejs/plugin-vue`——它内置了，无需手装。

## 实战 demo 锚点

| 路径 | 演示 |
|---|---|
| [`/learning-path/ecosystem/#03.vitepress-theme`](/learning-path/ecosystem/#03.vitepress-theme) | 自定义主题预览，模拟 sidebar / nav |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [VitePress 官方](https://vitepress.dev/) | 完整文档 |
| [主题继承](https://vitepress.dev/guide/extending-default-theme) | `enhanceApp` / Layout 插槽 |
| [`@vue/theme`](https://github.com/vuejs/theme) | 本项目用的主题源 |
| [`vue-vitepress-template`](https://github.com/zenHeart/learn-vue) | 仓库本体 |
