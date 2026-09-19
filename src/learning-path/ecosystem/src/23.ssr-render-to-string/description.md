> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/server-renderer/src/renderToString.ts` / `renderToStream.ts` / `renderToWebStream.ts` | **延伸阅读**：[Vue 官方 SSR](https://cn.vuejs.org/guide/scaling-up/ssr.html)

# 三种 SSR 渲染模式

## 这是什么

`@vue/server-renderer` 暴露三套 API 把组件树变成 HTML：

| API | 返回类型 | 适用场景 |
|---|---|---|
| `renderToString(app, ctx?)` | `Promise<string>` | 同步等待渲染完成；中间件路由、缓存层 |
| `renderToStream(app)` | `Node.js Readable` | 大型页面边渲染边发；TTFB 短 |
| `renderToWebStream(app)` | `Web ReadableStream` | Edge / Cloudflare Workers / Bun |
| `renderToNodeStream(app)` | 同 renderToStream（别名，3.4+ 已合并到 `renderToStream`） | — |

它们都接受同一个 `app`（来自 `createSSRApp`），并返回可消费的 HTML 流。

```ts
// 1) 字符串
const html = await renderToString(app, { url: req.url })

// 2) Node stream
const stream = renderToStream(app)
stream.pipe(res)

// 3) Web stream（Edge / Worker）
const stream = renderToWebStream(app)
return new Response(stream, { headers: { 'Content-Type': 'text/html' } })
```

## 源码走读

```ts
// packages/server-renderer/src/renderToString.ts
export async function renderToString(
  input: App | VNode,
  context: SSRContext = {},
): Promise<string> {
  const html = await renderComponentVNode(...)       // 渲染组件树
  await resolvePayload(...)                          // 等待 onServerPrefetch
  return html
}

// packages/server-renderer/src/renderToStream.ts
export function renderToStream(input: App | VNode): Readable {
  // 内部走 buffer + pipe：每个组件完成就立刻 flush，
  // 用户能边下载边解析，TTFB 远小于 renderToString
}
```

核心差异在**何时 flush**：
- `renderToString`：等所有组件全部完成才返回一整段
- `renderToStream`：每个子组件完成就把它的 HTML 推到流里，浏览器能提前收到 head

## hydration mismatch 错误捕获

`@vue/server-renderer` 抛出 hydration mismatch 时会把详情写到 console 警告。**`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` 编译期开关**控制 production 是否展开详细 diff（dev 默认开，prod 默认关）：

```ts
// vite.config.ts
define: {
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',  // 生产环境也打印详细 mismatch
}
```

运行期可用 `app.config.warnHandler` 收集到监控后端（见 `pitfalls/11`）。

## 实战场景

1. **小页面、缓存层**：用 `renderToString`——一次性返回字符串方便 cache / CDN。
2. **大页面、用户感知 TTFB 敏感**：用 `renderToStream`——head 优先渲染，body 异步出。
3. **Edge / Cloudflare Workers**：必须用 `renderToWebStream`——运行环境没有 Node stream。

## 常见踩坑

- **`renderToString` 的 ctx 只能放简单对象**：函数、`Symbol`、class instance 会被 JSON 化后丢失。
- **`renderToStream` 流结束后才能挂监听 error**：中途 flush 错误只能通过 `app.config.errorHandler` 捕获。
- **`renderToWebStream` 需要 runtime 支持 Web Streams**：Cloudflare Workers / Deno / Bun 原生支持；Node 18+ 也支持。
- **`<Suspense>` 在三种模式下行为一致**：都等待 async setup 完成后才 flush。
- **serverPrefetch 钩子只在 SSR 跑**：hydration 后不再触发；别在里头挂定时器。

## 性能对比（同页面）

| 模式 | TTFB | 完整下载 | 适合 |
|---|---|---|---|
| `renderToString` | 200-400ms | 200-400ms（一次返回） | 缓存页面、CDN 友好 |
| `renderToStream` | 30-80ms | 200-400ms（流式） | 大页面、个性化内容 |
| `renderToWebStream` | 30-80ms | 200-400ms（流式） | Edge runtime |

> 注：TTFB 与完整下载时间受应用复杂度影响；以上是常规 SPA + 简单页面的参考值。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 SSR](https://cn.vuejs.org/guide/scaling-up/ssr.html) | 完整 SSR 指南 |
| [Vue 官方 API](https://cn.vuejs.org/api/ssr.html) | server-renderer 全部 API |
| [Vue 源码](https://github.com/vuejs/core/tree/main/packages/server-renderer/src) | renderToString / renderToStream / renderToWebStream |
| [Nitro](https://nitro.unjs.io/) | Nuxt 3 底层——统一封装三种模式 |