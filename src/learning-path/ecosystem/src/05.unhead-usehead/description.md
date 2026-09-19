> 版本: unhead 1.x+ | RFC: — | 状态: stable | 概念: useHead 文档元信息

# unhead / useHead 实战

## 你会学到什么

`@unhead/vue` 是 Vue 生态的 head 管理器：你在组件里调用 `useHead()` / `useSeoMeta()`，它会**同步到 document head**——SSR 时还能注入到初始 HTML 里。它是 Nuxt 4 / VitePress 1.x 的核心依赖之一。

## 与 `@vueuse/head` 的关系

`@vueuse/head` 是 `unhead@1` 的 Vue 封装，**已被 `unhead@1` 同品牌取代**。如果在新项目里看到 `import { useHead } from '@vueuse/head'`，迁移到：

```ts
import { useHead } from '@unhead/vue'
```

API 100% 兼容。

## 最小可用

```vue
<script setup>
import { useHead, useSeoMeta } from '@unhead/vue'

useHead({
  title: 'About',
  meta: [
    { name: 'description', content: 'About page' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ]
})

useSeoMeta({
  ogTitle: 'About',
  ogDescription: 'A Vue demo',
  ogImage: '/og.png',
  twitterCard: 'summary_large_image',
})
</script>
```

## SSR 注入

服务端渲染时，`useHead` 注册的标签会进入 SSR 输出的 `<head>`——但前提是用了**同构的 entry**。Nuxt / VitePress 都内置；裸 Vite + vue-i18n + unhead 也能跑，但需要手动调 `useHead({ ssr: true })` 或在 `renderToString` 前用 `getActiveHead()` 拿 tags。

## 动手试

右侧 REPL 演示：

- 点击按钮切换标题 / 描述
- 观察 document.title 在浏览器 tab 上实时变
- 想看 SSR 行为？打开 DevTools 查看渲染后的 `<head>`

## 常见坑

| 现象 | 原因 | 修复 |
|---|---|---|
| 标题不更新 | 用了 `document.title = ...` 旁路 | 改用 `useHead({ title })` |
| SSR 头标签重复 | 多个 unhead 实例 | 用 `createHead()` 共享 |
| OG 标签在生产无效 | 忘了 `useSeoMeta` 而手写 `<meta>` | 统一走 unhead |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [@unhead/vue](https://unhead.unjs.io/) | 官方文档 |
| [从 `@vueuse/head` 迁移](https://unhead.unjs.io/guide/migration/v1) | 升级指南 |
| [Nuxt SEO](https://nuxtseo.com/) | 实战组合包 |
