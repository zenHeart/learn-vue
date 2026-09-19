> 版本: VueUse 10.x+ | RFC: — | 状态: stable | 概念: VueUse 组合式工具集

# VueUse 核心 Hooks

## 你会学到什么

`@vueuse/core` 提供了 200+ Composition 风格的工具函数（基于 Vue 3 reactivity），覆盖元素监听、网络、动画、设备能力、状态管理等领域。本节聚焦**最高频**的几个：

| Hook | 用途 |
|---|---|
| `useLocalStorage` | 自动持久化 ref 到 localStorage（双向同步） |
| `useDebounceFn` | 函数防抖 |
| `useEventListener` | 自动清理的 `addEventListener` 包装 |
| `useIntersectionObserver` | 元素可见性观察（懒加载、动画触发） |

## 最小用法

```ts
import { useLocalStorage, useDebounceFn, useEventListener, useIntersectionObserver } from '@vueuse/core'

const name = useLocalStorage('app.name', 'guest')
const onSearch = useDebounceFn((q) => fetch(`/api?q=${q}`), 300)
useEventListener(window, 'resize', () => console.log(window.innerWidth))

const target = ref(null)
const { stop, isIntersecting } = useIntersectionObserver(target, ([entry]) => {
  console.log('visible?', entry.isIntersecting)
})
```

## SSR 安全

大部分 VueUse hook 在服务端也能用——内部用 `import.meta.client` 区分。少数会访问 `window` / `document` 的：

- 在 setup 顶层直接调用 → SSR 报错
- 解决：包在 `if (import.meta.client) { ... }` 里，或用 `tryOnMounted(() => useEventListener(...))`

`@vueuse/nuxt` / `@vueuse/headless` 提供了自动 SSR 适配。

## 动手试

右侧 REPL 演示：

- 搜索框 `useDebounceFn` 防抖（300ms 后才请求）
- 名字 `useLocalStorage` 持久化（刷新页面不丢）
- 卡片 `useIntersectionObserver` 滚到底部才出现

## 常见坑

| 现象 | 原因 | 修复 |
|---|---|---|
| SSR `document is not defined` | hook 在服务端调用 | 移到 `onMounted` 或加 `import.meta.client` |
| localStorage 数据类型错误 | 序列化 / 反序列化失败 | `useLocalStorage(key, defaultValue, { serializer: { read, write } })` |
| IntersectionObserver 不触发 | 元素没渲染 | 用 `ref(null)` + `nextTick` 后再观察 |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [VueUse 官方文档](https://vueuse.org/) | 完整 hook 索引 |
| [SSR 适配](https://vueuse.org/guide/ssr.html) | Nuxt / VitePress 用法 |
| [集合函数](https://vueuse.org/shared/createSharedComposable/) | 全局共享单例 |
