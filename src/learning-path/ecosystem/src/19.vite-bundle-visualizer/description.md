> **版本**：rollup-plugin-visualizer 5.x+ | **状态**：stable | **概念**：bundle vendor / split 分析

# Vite bundle vendor 拆分与 split 分析

## 这是什么

`rollup-plugin-visualizer` 把 bundle 体积分布渲染成交互式 treemap——但**光看图不够**，要会拆。本节在 14.bundle-analyze 的基础上深入：怎么用 `manualChunks` 把 vendor 从 app code 拆出来，怎么判断某个依赖该不该单独拆，怎么验证拆分后首屏加载变快。

Rollup 默认把所有 module 打到一个 chunk；Vite 的 `build.rollupOptions.output.manualChunks` 给一个函数，由你决定每个模块去哪个 chunk。函数签名 `(id, meta) => string | undefined`，返回 chunk 名。

## 实战配置

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 按依赖大小与变更频率拆 chunk
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 高频改动的库：单独拆
            if (id.includes('vue-i18n') || id.includes('@vueuse/core')) return 'vendor-runtime'
            // 大体积低频：单独拆（更利于长期缓存）
            if (id.includes('echarts') || id.includes('monaco-editor')) return 'vendor-heavy'
            // 框架 + 路由
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) return 'vendor-framework'
            // 其他所有 node_modules：合到一个 'vendor'
            return 'vendor'
          }
          // 业务代码不动：每个入口 / 路由懒加载时由 Rollup 自动拆
        },
        // chunk 文件命名模板：方便 cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
})
```

## 怎么判断拆得对不对

报告生成后，关注三类指标：

| 指标 | 期望 |
|---|---|
| 单 chunk 体积 | < 244 KB（gzip 前）—— 超过则考虑再拆 |
| vendor chunk 数量 | 通常 2-4 个：framework / runtime / heavy / catch-all |
| cache 命中率 | 业务代码高频变更，vendor 应稳定 30 天以上不动 |

## 进阶：动态 import 拆路由

```ts
// router.ts
const routes = [
  { path: '/admin', component: () => import('./views/Admin.vue') },
  { path: '/chart', component: () => import('./views/Chart.vue') },
]
```

路由级懒加载自动让 Rollup 按入口拆 chunk；配 `vite preview --strictPort` + Lighthouse 验证首屏不会把 Admin 拉进来。

## 源码走读

```ts
// rollup 输出阶段调用
manualChunks(id, meta) {
  // id: 完整模块路径 '/proj/node_modules/vue/dist/vue.runtime.esm-bundler.js'
  // meta: { getModuleInfo, getModuleIds }
  // 返回 string → 进对应 chunk；返回 undefined → Rollup 自动归类
}
```

返回值必须稳定——同一个模块每次构建要进同一个 chunk，否则 hash 变化导致缓存失效。

## 常见踩坑

- **拆太多**：每个 chunk < 5KB 会产生大量 HTTP 请求，反而更慢。HTTP/2 下请求成本低，但 HTTP/1.1 项目要慎重。
- **循环依赖导致重复打包**：检查 `pnpm why <pkg>` 锁版本，`pnpm dedupe` 合并重复依赖。
- **动态 chunk 名 hash 不稳定**：`manualChunks` 返回值含变量（如时间戳）会导致 hash 抖动——保持纯函数。
- **vendor 体积反弹**：业务依赖增长后，catch-all `vendor` 膨胀 → 重新跑报告 → 拆出新的"heavy"组。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) | treemap / sunburst 报告 |
| [Vite manualChunks](https://rollupjs.org/configuration-options/#output-manualchunks) | 函数签名 |
| [相关 demo](./) | 14.bundle-analyze 给出 treemap 解读基础 |
