> 版本: Vite 5+ / vite-ssg / @vue/server-renderer | RFC: — | 状态: stable | 概念: Vite SSR / SSG

# Vite SSR / SSG

## 你会学到什么

Vue 3 的 SSR 由 `@vue/server-renderer` 提供 `renderToString`；如果你想**静态预渲染**（SSG），用 `vite-ssg` 一行命令把整个站导出 HTML。本节展示手动 SSR 与 SSG，并拆解最常见的 hydration mismatch。

## 手动 SSR

```ts
// entry-server.ts
import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'

export async function render(url: string) {
  const app = createApp()
  const html = await renderToString(app)
  return html
}
```

Node server 里拿到 `html` 后塞进模板：

```ts
app.get('*', async (req, res) => {
  const appHtml = await render(req.url)
  res.send(`<!DOCTYPE html><html><body><div id="app">${appHtml}</div></body></html>`)
})
```

## vite-ssg

```ts
// src/main.ts
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'

export const createApp = ViteSSG(App, { routes })
```

构建时 `vite-ssg build` 自动爬取路由 → 调用 `renderToString` → 输出 `.html` 到 `dist/`。

## Hydration mismatch 典型成因

1. **时区 / Date.now()** — 服务端时间和客户端不一致 → 时间戳错位
2. **Math.random() / uuid** — 每次生成不同
3. **localStorage / cookie** — 服务端读不到
4. **window.matchMedia** — 服务端没有 matchMedia API
5. **CSS-in-JS 在 SSR 时拿不到 class** — emotion / styled-components 经典坑

```vue
<template>
  <p>{{ new Date().toLocaleString() }}</p>  <!-- 服务端、客户端时间不同 -->
</template>
```

**修复**：把这种逻辑放进 `onMounted()`（客户端 only），或用 `import.meta.client` 守卫。

## 动手试

右侧 REPL 演示 SSR 输出 + 客户端 hydration 后的 DOM。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 3 SSR 指南](https://vuejs.org/guide/scaling-up/ssr.html) | 官方文档 |
| [vite-ssg](https://github.com/antfu/vite-ssg) | 静态预渲染 |
| [Nuxt](https://nuxt.com/) | 完整 SSR 框架 |
