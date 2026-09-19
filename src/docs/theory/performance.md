# Vue 性能优化全景图

把 Vue 应用的性能问题归到五大类，对应不同的优化手段与排查工具。本文件是导航，配合 `learning-path/performance/` 下 12 个交互式 demo 一起用。

## 五类性能问题

| 类别 | 触发场景 | 关键手段 | 性能 demo |
|------|---------|---------|-----------|
| **渲染** | 大列表、深嵌套组件、频繁 patch | 虚拟滚动、v-memo、KeepAlive 缓存 | `04`, `05`, `07` |
| **响应式** | 大对象 reactive、逐键依赖追踪 | shallowRef、toRaw 快照派生、computed 缓存 | `01`, `02`, `08`, `09` |
| **加载** | 首屏 JS 体积大、TTFB 慢 | 动态 import、SSR/SSG、preload | `06`, `08` |
| **内存** | 长期持有大对象、closure 残留 | markRaw、shallowRef 替换语义 | `02`, `12`, `13` |
| **网络 / 时序** | 同步触发、动画掉帧 | flushSync、nextTick vs rAF、watchEffect flush | `10`, `11`, `12` |

## 选型决策树

```
卡顿 → 哪一类？
  │
  ├─ 渲染（DOM 操作慢）→ 虚拟滚动 / v-memo
  │
  ├─ 响应式（依赖追踪）→ shallowRef + 整体替换
  │
  ├─ 加载（首屏体积）→ 动态 import + SSR
  │
  ├─ 内存（堆增长）→ markRaw / 整体替换
  │
  └─ 时序（调度）→ 批处理 + flushSync 边界
```

## 学习路径

按推荐顺序浏览：

1. `01.reactive-spread-projection` — 理解响应式开销的根源
2. `02.reactive-overhead-bench` — 量化四种响应式容器
3. `04.v-memo-list` — 渲染层面的微观优化
4. `07.virtualized-list-perf` — 万行渲染兜底
5. `10.scheduler-batch` — 调度与时序
6. `08.ssr-vs-csr` — 加载策略
7. `06.bundle-analyze-demo` — 构建产物分析
8. `13.reactive-vs-immutable` — 不可变数据场景
9. `11.nexttick-vs-raf` — 动画与 DOM 时序
10. `12.watch-effect-flush-options` — watch 精度
11. `05.keepalive-include-excludes` — 缓存策略
12. `09.reactive-deep-vs-shallow-bench` — 嵌套场景
13. `03.computed-memo-vs-getter` — 模板表达式陷阱

## 度量工具

| 工具 | 用途 |
|------|------|
| Vue DevTools Performance | 组件 update 次数、render 时长 |
| Chrome Performance | 主线程长任务、layout / paint |
| `performance.now()` | REPL 中量化耗时 |
| `onTrack` / `onTrigger` | 数依赖、查触发链 |

## 官方资源

- [Performance — Vue.js](https://vuejs.org/guide/best-practices/performance.html)
- [Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Built-in Components — KeepAlive](https://vuejs.org/guide/built-ins/keep-alive.html)
- [Server-Side Rendering Guide](https://vuejs.org/guide/scaling-up/ssr.html)
