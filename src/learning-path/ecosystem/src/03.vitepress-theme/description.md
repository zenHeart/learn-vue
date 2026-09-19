> 版本: VitePress 1.x+ | RFC: — | 状态: stable | 概念: VitePress 自定义主题

# VitePress 自定义主题

## 你会学到什么

VitePress 主题本质是一个 Vue 3 应用：`layouts`、`components`、`styles` 三个目录组织成 SPA。本项目本身就用了 `@vue/theme`，下面展示**如何继承默认主题、扩展 nav/sidebar、注入自定义 layout**。

## 主题目录约定

```
.vitepress/
├── config.ts            # 主配置（站点元数据 + nav + sidebar）
├── theme/
│   ├── index.ts         # 主题入口，注册 layout / 全局组件
│   ├── components/      # 自定义组件，@theme 别名指向这里
│   ├── layouts/         # 自定义 layout
│   └── styles/          # 全局样式
└── public/              # 静态资源
```

## 继承默认主题

```ts
// theme/index.ts
import DefaultTheme from 'vitepress/theme'
import MyLayout from './layouts/MyLayout.vue'

export default {
  extends: DefaultTheme,
  Layout: MyLayout, // 完全替换；保留插槽可写继承版
}
```

如果你只想扩展不想整体替换，可以**不**改 `Layout`，只通过 `enhanceApp({ router, siteConfig })` 注册全局组件 / 指令 / 自定义 CSS 变量。

## nav / sidebar 配置

```ts
// config.ts
export default defineConfig({
  themeConfig: {
    nav: [
      { text: 'Docs', link: '/docs/' },
      { text: 'Learning Path', link: '/learning-path/' }
    ],
    sidebar: {
      '/docs/': [
        { text: '工具', items: [
          { text: 'Vite', link: '/docs/tools/vite' }
        ]}
      ]
    }
  }
})
```

本项目用 `sidebar-generator.ts` 自动扫描 `src/learning-path/*/src` 和 `src/docs/*` 目录生成 sidebar。

## 动手试

打开右侧 REPL，**实际跑不起来**——VitePress 是构建时工具。但可以看到：

- 渲染出的模拟站点截图样例
- nav 数组的结构化展示
- sidebar 自动生成的伪代码

> 真实项目：本仓库的 `.vitepress/config.ts` 就是这种写法的范本。

## 常见坑

| 现象 | 原因 | 修复 |
|---|---|---|
| 自定义组件 `Foo` 不显示 | 没在 `theme/index.ts` 注册或没用 `@theme/Foo` 路径 | 用 `@theme` 别名引用 |
| 主题生效但样式没注入 | `styles/index.css` 路径写错 | 放在 `theme/styles/` 下 |
| sidebar 不刷新 | 没改 `sidebarHMRPlugin` | 在 dev 时手动 `pnpm dev` 重启 |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [VitePress — 自定义主题](https://vitepress.dev/guide/custom-theme) | 官方文档 |
| [Layout 插槽](https://vitepress.dev/guide/extending-default-theme#layout-slots) | 在 `Layout: undefined` 时插入自定义块 |
| [@vue/theme 源码](https://github.com/vuejs/theme) | 本项目用的主题源 |
