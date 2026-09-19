> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/server-renderer/src/renderToStream.ts`

# 流式 SSR vs 完整 bundle SSR

## 这是什么

「流式 SSR」用 `renderToStream` / `renderToWebStream`，**每个子组件完成时立刻 flush** 到响应流；「完整 bundle」用 `renderToString`，等所有组件渲染完才返回一整段字符串。两者性能差距在大页面、慢查询场景下非常明显：

```
流式 SSR：
  t=0       flush <html><head>...</head>          ← TTFB
  t=20ms    flush <header>导航...</header>
  t=120ms   flush <main>第 1 屏卡片...</main>
  t=350ms   flush <main>异步评论加载中…</main>
  t=600ms   flush <main>评论已就绪</main>          ← 全部到达
  t=600ms   stream end

完整 bundle：
  t=0       request received
  t=580ms   res.send(html)                       ← TTFB = FCP
  t=600ms   client receives
```

差异关键：**流式 SSR 的 TTFB ≈ 30-80ms**，FCP 仍然要等异步内容完成；但用户能在等待期间**滚动 / 看导航 / 提前交互**。

## 源码走读

```ts
// packages/server-renderer/src/renderToStream.ts
export function renderToStream(input) {
  const stream = new PassThrough()
  ;(async () => {
    try {
      const ctx = createSSRContext()
      const { app, router } = await Promise.resolve(input)
      await routeFlush(ctx, ...)
      const buffer = new ReadableBuffer()
      buffer.push(ctx.template.head)         // 1) 立刻 flush head
      walkComponentTree(buffer, ...)         // 2) 每个组件完成就 push
      buffer.push(ctx.template.tail)         // 3) 最后 flush 闭合标签
      buffer.push(null)                      // 4) close stream
    } catch (e) {
      stream.destroy(e)
    }
  })()
  return stream
}
```

流式 SSR 的核心是**渲染顺序与 HTML 树深度优先遍历**——浏览器看到 `<main>` 的开头时就可以开始 parse 并行下载后续 chunks。

## 实战场景

1. **大页面 + 个性化**：电商商品详情（顶部静态、底部评论流异步）。
2. **慢查询混排**：顶部内容（DB 快）+ 底部推荐（DB 慢）——流式让快部分先出。
3. **SSR 缓存**：用 `renderToString` 把结果存 Redis；用 `renderToStream` 时机敏的内容。
4. **首屏 TTFB SLA**：要求 TTFB < 100ms 的产品页几乎必须用流式。

## 常见踩坑

- **流式 SSR 不能用 HTTP 缓存层**：响应是 chunked transfer encoding，不能整段缓存；只有 head 部分能放 CDN。
- **浏览器要先拿到 `<!--ssr-outlet-->` 占位符**：模板拆分有顺序约束——见 `ecosystem/24.vue-ssr-vite-config`。
- **Suspense fallback 必须 inline**：服务端 fallback 不会异步；hydration 时 fallback 已经被替换为内容，可能造成 mismatch。
- **`<Suspense>` 的 resolve 顺序在两端必须保持**：服务端按注册顺序 flush，client 端 hydrate 后立刻 resolve——若顺序不一致会触发 warning。
- **错误难以调试**：流中途抛错只能通过 `app.config.errorHandler` 捕获；浏览器看到的可能是「页面被截断」。

## 性能基线（同页面、同 node 进程）

| 模式 | TTFB | FCP | LCP | 总下载耗时 |
|---|---|---|---|---|
| 完整 bundle | 200-400ms | 400-600ms | 800-1200ms | 800-1200ms |
| 流式 | 30-80ms | 200-400ms | 800-1200ms | 800-1200ms |
| 流式 + Suspense 拆分 | 30-80ms | 100-200ms | 600-900ms | 800-1200ms |

> 注：实际数字受应用复杂度、数据库查询、网络环境影响；以上为 SPA + 简单 SSR 的参考值。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 SSR](https://cn.vuejs.org/guide/scaling-up/ssr.html) | 流式 SSR 与 Suspense |
| [Vue 官方 API](https://cn.vuejs.org/api/ssr.html) | server-renderer |
| [Vue 源码](https://github.com/vuejs/core/blob/main/packages/server-renderer/src/renderToStream.ts) | renderToStream 实现 |
| [Nuxt Streaming](https://nuxt.com/docs/guide/concepts/rendering#streaming) | Nuxt 流式 SSR |