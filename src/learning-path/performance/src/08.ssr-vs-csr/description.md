> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: SSR vs CSR 性能对比

# SSR vs CSR：首屏 LCP 与 hydration 成本（mock）

## 你会学到什么

- SSR（服务端渲染）首屏 HTML 直接可见，LCP 显著提前
- CSR（客户端渲染）首屏空白，等 JS 下载 + 执行 + hydrate 才显示
- `useSSRContext()` 拿到 SSR 阶段的全局对象（client 拿到 `undefined`）
- 同一组件走两种路径的耗时对比（mock，不真实启动服务器）

## 真实场景（抽象）

一个文章详情页：含标题、作者、正文段落、相关文章列表。
- ① SSR：模拟服务端拼字符串 + 序列化时间
- ② CSR：模拟 JS 下载 + mount + 渲染时间
- ③ 同构：SSR + hydration（前端 attach 后 LCP 几乎无回退）

## 动手试

1. 点击「跑 SSR mock」看渲染时长 + LCP 时间
2. 点击「跑 CSR mock」对比
3. 看 LCP 差值（CSR ≈ JS 下载 + 渲染，SSR ≈ 序列化 + 网络）

## 根因

- SSR：HTML 在服务端组装，浏览器一收到就能 paint（受 TTFB 限制）
- CSR：浏览器收到空 HTML → 拉 JS → 执行 → mount → paint（受 download + parse + execute 累加）
- hydration：复用 SSR DOM，但要 patch 事件 + 比对 vnode，CPU 仍要花

## 修复 / 选型

- 内容型页面（文章、商品、文档）：SSR / SSG
- 强交互后台：CSR
- 内容 + 部分交互：SSR + Selective Hydration
- `<NuxtLink prefetch>`：空闲时段拉取下一页 chunk

## 延伸阅读

- [Server-Side Rendering Guide](https://vuejs.org/guide/scaling-up/ssr.html)
- [Hydration Mismatch](https://vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch)

## 小结

1. **现象**：首屏慢。
2. **复现**：对比 SSR / CSR / SSG 的 LCP。
3. **修复**：按页面类型选渲染策略。
