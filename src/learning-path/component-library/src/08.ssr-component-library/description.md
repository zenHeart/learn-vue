> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: 组件库 SSR 适配

# 08 · 组件库 SSR 适配

## 你会学到什么

服务端渲染（SSR）下，组件库会遇到一系列客户端不会遇到的问题：

1. **window/document 访问**：服务端没有 `window`，Naive UI / Element Plus 内部用 `getBoundingClientRect`、`IntersectionObserver` 的代码会炸
2. **Hydration mismatch**：server 渲染的 HTML 与 client 渲染的不一致，控制台红字警告
3. **DOM-only API**：Popper、floating-ui 在服务端无法计算位置
4. **CSS-in-JS 注入**：styled-components / emotion 在 server 与 client 需保持一致

主流组件库的应对：

| 库 | 策略 |
|----|------|
| Element Plus | `useGlobalConfig` 提供 `ssr` 字段；内置 `<ClientOnly>` 等价于 `v-if="isClient"` |
| Naive UI | 内部 `onMounted` 才计算尺寸；客户端浮动用 `v-if` 包 |
| Ant Design Vue | `ssrOutlet` 把不可 SSR 部分导出到客户端 |
| PrimeVue | 通过 `app.use(PrimeVue, { unstyled: ... })` 控制 |

本 demo 实现：

- `useIsClient()` composable —— 安全检测是否在客户端
- `<ClientOnly>` 包装器 —— 包裹 DOM-only 组件
- mock 一次 hydration mismatch 场景，给出排查路径
- Element Plus `ElConfigProvider` 在 SSR 下的 server-only 字段演示

## 真实场景（抽象）

> "我们的产品迁移到 Nuxt 3 后，引入 Element Plus 后控制台满屏红字：
> Hydration node mismatch、document is not defined、cannot read property 'getBoundingClientRect' of null。"

这个 demo 告诉你每个红字对应什么场景、如何定位、如何修。

## 动手试

1. 默认 server 环境：所有 DOM-only 组件不渲染（用 `useIsClient`）
2. 点「模拟 hydrate」—— 切到客户端，组件出现
3. 触发 mock hydration mismatch —— 看错误信息
4. 切换 server-only 字段（locale）—— 观察 SSR 数据如何不污染 client

## 关键模式

### useIsClient

```ts
export const useIsClient = () => {
  // 服务端：false；客户端：true
  return import.meta.client ?? (typeof window !== 'undefined')
}
```

### ClientOnly 包装

```vue
<ClientOnly>
  <FloatingPopover />  <!-- 用了 getBoundingClientRect 的组件 -->
  <template #fallback>
    <div class="skeleton">骨架屏</div>
  </template>
</ClientOnly>
```

```ts
// ClientOnly 实现
const ClientOnly = defineComponent({
  setup(_, { slots }) {
    const isClient = useIsClient()
    return () => isClient ? slots.default?.() : slots.fallback?.()
  },
})
```

### 避免 hydration mismatch

| 场景 | 修复 |
|------|------|
| `Date.now()` 不同 | 用 `useState` 在 server 与 client 共享 |
| `Math.random()` | 同上 |
| `localStorage.getItem()` | 包 ClientOnly |
| `<head>` 标签内容 | 双方用相同 SSR config |
| 用户登录信息 | SSR 时跳过，client 时 hydrate |

### Element Plus SSR 模式

```ts
// Element Plus 在 SSR 下会自动判断 server / client
// 但需要 server-only 的字段，例如 locale：
const config = {
  locale: 'zh-CN',
  // 这是 server 时需要的，client 会再覆盖
  size: 'default',
}

createSSRApp(App).use(ElementPlus, { size: 'default' })
```

## 常见错误与修复

| 错误信息 | 原因 | 修复 |
|----------|------|------|
| `document is not defined` | 组件 setup 同步访问了 document | 包 `onMounted` 或 `ClientOnly` |
| `Hydration node mismatch` | server / client 输出不同 | 检查时间、随机、localStorage |
| `Cannot read property 'getBoundingClientRect' of null` | 元素未挂载就访问 | 包 `onMounted` |
| `<style>` 没生效 | SSR CSS extraction 未配置 | 配 `vite-plugin-vue-ssr` 或 Nuxt `<style>` extract |

## 主流方案对比

| 方案 | 学习成本 | 灵活度 | 适用 |
|------|---------|--------|------|
| Nuxt + 组件库模块 | 低 | 中 | Nuxt 3 项目 |
| Vite SSR 手动 | 中 | 高 | 自研框架 |
| Quasar SSR | 低 | 中 | Quasar 自带 SSR |
| Astro Vue 集成 | 低 | 低 | 静态站点为主 |

## 进阶

- streaming SSR（`<Suspense>` 分块）
- island 架构（Astro）
- 服务端 component cache

## 延伸阅读

- [Nuxt 3 SSR 文档](https://nuxt.com/docs/guide/concepts/rendering)
- [Element Plus SSR Guide](https://element-plus.org/en-US/guide/ssr.html)
- [Vue 官方 SSR](https://cn.vuejs.org/guide/scaling-up/ssr.html)

## 收尾

8 节看完，你应该能：
- 在 30 分钟内判断一个项目该用哪个组件库
- 看懂主流组件库的源码组织
- 用同样范式自研一套 MVP 组件库
- 排查 SSR 与按需引入的常见坑

后续建议阅读 [`docs/tools/component-library.md`](../../docs/tools/component-library.md) —— 主流组件库横向对比与选型指南。
