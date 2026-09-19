> 版本: rollup-plugin-visualizer 5.x+ | RFC: — | 状态: stable | 概念: bundle 体积分析

# Bundle 体积分析

## 你会学到什么

`rollup-plugin-visualizer` 在 `vite build` 时统计所有 chunk 的体积构成，输出 treemap / sunburst / network 视图的 HTML 报告。读这份报告能快速定位"为什么首页加载这么慢"——答案往往藏在某个你忘了 tree-shake 的图标库里。

## 配置

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 'sunburst' | 'network' | 'treemap'
    })
  ],
})
```

跑 `pnpm build` 后打开 `dist/stats.html`。

## 怎么读 treemap

- **最大色块** = 体积大头，先优化这块
- **细碎小色块** = 工具函数集合（lodash-es / date-fns / iconfont）
- **颜色一致** = 同一 chunk / 模块

实战判断：

| 现象 | 诊断 | 处理 |
|---|---|---|
| `lodash` 整包 70KB | 没 `lodash-es` 全量 import | 改 `lodash-es` + 按需 |
| 整个图标库 200KB | `import * as Icons from '@iconify/...'` | 改按需 import 或自建 svg |
| 重复包 | 不同版本依赖同时打入 | `pnpm dedupe` |
| vendor chunk 过大 | 没分 vendor | `build.rollupOptions.output.manualChunks` |

## 动手试

右侧 REPL 模拟一个真实的 bundle 报告：列出体积 TOP 5 模块、占总包比、gzip 后体积。

## 按需引入 vs 全量

```ts
// ❌ 全量
import * as ElementPlus from 'element-plus'
app.use(ElementPlus)

// ✓ 按需（自动）
// unplugin-vue-components + ElementPlusResolver 帮你处理
```

按需引入后 bundle 通常能从 ~1MB 降到 ~200KB。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) | 仓库 |
| [Vite 构建优化](https://cn.vitejs.dev/guide/build.html) | manualChunks、target |
| [Bundlephobia](https://bundlephobia.com/) | npm 包体积查询 |
