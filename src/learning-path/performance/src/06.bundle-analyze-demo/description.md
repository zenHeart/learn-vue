> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: 产物体积分析

# Bundle 分析：动态 import 与代码分割

## 你会学到什么

- 用 `import.meta.glob` 模拟大依赖（运行时再加载）
- 动态 `import()` 把代码拆成独立 chunk，首屏体积下降
- 在 REPL 中看「主 chunk」与「按需 chunk」加载时机的差异

## 真实场景（抽象）

一个工具箱页面有三个重型模块：图表编辑器、Markdown 预览、地图工具。默认只显示入口卡片，点击模块时再加载对应实现。

## 动手试

1. 首次加载：只看到「主 chunk」日志
2. 点击「加载图表」：触发动态 import，对应 chunk 下载日志出现
3. 反复切换：缓存命中，不再重复下载

## 根因

打包工具（Vite / Rollup / webpack）把动态 `import()` 拆成独立 chunk，浏览器按需加载。`import.meta.glob` / `defineAsyncComponent` 都是同源思路。

## 修复 / 选型

- 大型组件：`defineAsyncComponent(() => import('./Big.vue'))`
- 路由懒加载：`component: () => import('@/pages/X.vue')`
- 预加载：`<link rel="modulepreload" href="...">` 在空闲时段拉取

## 延伸阅读

- [Dynamic Import in Vite](https://vite.dev/guide/features.html#dynamic-import)
- [Async Components](https://vuejs.org/guide/components/async.html)

## 小结

1. **现象**：首屏 JS 体积过大。
2. **复现**：观察 chunk 加载日志。
3. **修复**：动态 import + 路由懒加载。
