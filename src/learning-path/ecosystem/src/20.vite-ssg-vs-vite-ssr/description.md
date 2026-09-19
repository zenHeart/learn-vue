> **版本**：vite-ssg 0.x+ | **状态**：stable | **概念**：静态预渲染 vs 实时 SSR

# vite-ssg 与手写 SSR 的对比

## 这是什么

`vite-ssg` 是 antfu 出品的"SSG-as-build-step"工具：构建期爬取路由 → 调 `renderToString` → 输出 HTML。产物体积等同于静态站点，但保留了客户端 hydration 的好处（事件、路由切换、状态管理）。和"真 SSR（Node server 实时渲染）"是两个不同的范式，**不能直接换**——本节讲清两者的边界。

| 维度 | vite-ssg | 手写 SSR |
|---|---|---|
| 渲染时机 | build 时一次 | 每个请求 |
| 部署形态 | 静态文件（CDN / OSS） | Node 服务（PM2 / k8s） |
| 数据时效 | 构建快照；过期需重新 build | 实时（DB / API 拉到当下一刻） |
| 适用内容 | 博客、文档、营销页、产品介绍 | 登录态、个性化、动态数据 |
| 启动延迟 | 0（CDN 边缘缓存） | 50-200ms（renderToString） |
| 复杂度 | 低（一行命令） | 中（Node server + 进程管理） |

## 实战配置

```ts
// src/main.ts
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'
import { createPinia } from 'pinia'
import { i18n } from './i18n'

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
  },
  ({ app, router, routes, isClient, initialState }) => {
    // 客户端 + 服务端都跑
    app.use(createPinia())
    app.use(i18n)
    if (import.meta.env.SSR) {
      // 仅 SSR：按路由 meta 预取数据
      router.beforeEach(async (to) => {
        const loader = to.meta.loader as (() => Promise<any>) | undefined
        if (loader) initialState[to.path] = await loader()
      })
    }
  },
)
```

构建：

```bash
# 预渲染所有路由
vite-ssg build

# 仅预渲染指定路由
vite-ssg build --include '/,/about,/docs/*'

# 自定义输出目录
vite-ssg build --outDir dist-static
```

## 两种 hydration 策略

```ts
// 1. 整页 hydration（默认）
// 服务端渲染的 HTML 完整保留，客户端从全量 hydrate 开始
ViteSSG(App, { routes })

// 2. 部分 hydration（按 island）
// 静态部分不 hydrate，只有交互岛挂载
// vite-ssg 不直接支持；改用 VitePress / Astro
```

## 源码走读

```ts
// vite-ssg/src/node.ts（简化）
export async function build(ssgOptions: ViteSSGOptions) {
  await buildVite()                              // 1. Vite 产物
  const { routes } = ssgOptions
  for (const route of routes) {
    const app = createApp(route)
    const html = await renderToString(app)       // 2. 爬路由渲染
    await saveHtml(route, html)                  // 3. 落盘 .html
  }
}
```

核心就是「Vite build + 后置爬路由 + `renderToString`」三步——没有任何黑魔法。

## 何时选哪个

```text
                  ┌─────────────────┐
                  │ 内容是否频繁变？ │
                  └────────┬────────┘
                  是 ↓          ↓ 否
        ┌─────────────────┐  ┌──────────┐
        │ 是否需登录态？   │  │ 选 SSG   │
        └────┬────────────┘  └──────────┘
        是 ↓      ↓ 否
     ┌────────┐  ┌────────────────┐
     │ 实时SSR │  │ ISR / 重新构建 │
     └────────┘  └────────────────┘
```

**ISR（Incremental Static Regeneration）**：Netlify / Vercel 等平台支持"按访问重新生成"——本质是 SSG + 边缘函数缓存折中。

## 常见踩坑

- **`localStorage` 在 SSR 报错**：构建时 `window` 不存在；用 `if (import.meta.env.SSR)` 或 `tryOnMounted()` 守卫。
- **路由 meta 加载顺序**：`router.beforeEach` 在 SSG 期间同步执行；异步 loader 必须 `await`，否则 `initialState` 是空。
- **Hydration mismatch**：见 13.vite-ssr——SSG 输出的 HTML 与客户端 hydrate 时的状态不一致，常见原因是构建期与运行期时间差。
- **静态文件 404**：CDN 配置 SPA fallback 时，所有未匹配路径要返回 `index.html`，否则刷新 404。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [vite-ssg 官方](https://github.com/antfu/vite-ssg) | API 与配置 |
| [@vue/server-renderer](https://vuejs.org/api/ssr.html) | renderToString 文档 |
| [相关 demo](./) | 13.vite-ssr 讲解 hydration mismatch 与手写 SSR 基础 |
