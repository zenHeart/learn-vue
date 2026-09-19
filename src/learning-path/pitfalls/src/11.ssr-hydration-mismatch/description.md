> **版本**：Vue 3.5+ | **状态**：stable | **源码**：`packages/runtime-core/src/hydration.ts` | **延伸阅读**：[Vue 官方 SSR 警告](https://cn.vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch)

# SSR Hydration Mismatch 排查

## 这是什么

「Hydration mismatch」指 SSR 阶段产出的 HTML 与 client hydrate 时渲染的 vnode 不一致。Vue 检测到后会触发警告、强制 client 用自己的 vnode 重新 patch——**首屏结构错位、闪烁、事件丢失**。

常见成因：

| 成因 | 示例 |
|---|---|
| 时间 / 随机数 | `new Date().toLocaleString()`、`Math.random()` |
| 客户端 API | `window.innerWidth`、`localStorage.getItem` |
| HTML 嵌套 | 服务端 `<p>` 内 `<div>`；浏览器自动闭合成 `<div><p></p></div>` |
| class / 属性随机 | `cls="bg-{{ Math.random() }}"` |
| 时区 / locale | `toLocaleString()` 在两端 locale 不一致 |
| 第三方组件版本不一致 | 服务端、客户端 npm 依赖版本错位 |
| `<ClientOnly>` 缺失 | 仅在 client 渲染的组件没包 `<ClientOnly>` |
| `v-if` 条件依赖客户端 | 服务端无 `localStorage`，客户端有 |

## 源码走读

```ts
// packages/runtime-core/src/hydration.ts
function handleMismatch(...) {
  if (__DEV__ || __FEATURE_PROD_HYDRATION_MISMATCH_DETAILS__) {
    warn(`Hydration node mismatch:\n...`)
  }
  // 强制 client 接管
  clientNode = clientNode.nextSibling
  patch(container, ...)             // 重新 patch
}
```

**3.5+ 新增 `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` 编译开关**：prod 默认关闭详细 diff；想排查线上问题时必须打开。

## 收集警告到监控后端

```ts
app.config.warnHandler = (msg, instance, trace) => {
  if (msg.startsWith('[Vue warn]: Hydration')) {
    Sentry.captureMessage(msg, {
      level: 'warning',
      extra: { trace, component: instance?.type.name },
    })
  }
  // 始终 console.warn
  console.warn(msg)
}
```

## `data-allow-mismatch`（3.5+）

Vue 3.5 引入 `data-allow-mismatch="text"` / `"class"` / `"style"` / `"attribute"`——显式声明「这一处可以不一致」，hydration 阶段不报警告、不强制 patch。

```vue
<time :datetime="iso">{{ format(iso) }}</time>

<script setup>
const iso = '2026-01-01T00:00:00Z'
function format(d) { return new Date(d).toLocaleString() }  // 服务端、客户端 locale 不同
</script>
```

```vue
<!-- 显式放行 -->
<time :datetime="iso" data-allow-mismatch="text">{{ format(iso) }}</time>
```

支持的值：
- `"text"`：文本内容不一致
- `"class"`：class 列表不一致
- `"style"`：style 列表不一致
- `"attribute"`：任意 attribute 不一致

## 实战场景

1. **页面带时间戳**：用 `data-allow-mismatch="text"` 显式放行；用户看到的 server-rendered 时间戳与 hydrate 后真实时间略有差异是可接受的。
2. **首屏随机背景色**：在 `<style>` 里用 CSS 变量 + `data-allow-mismatch="style"`，hydration 不报警。
3. **第三方组件日期库**：`date-fns` / `dayjs` 在两端用同一 locale 配置。
4. **class 来自 hash**：路由跳转后给 hash 路由 active class，SSR 路径 hash 永远是空。

## 常见踩坑

- **`data-allow-mismatch` 不解决真实 bug**：只在「**确认差异无害**」时使用；其他场景仍要修代码。
- **dev 警告详细、prod 警告静默**：prod 漏掉 hydration warning 会让用户看到错位；务必挂 `warnHandler`。
- **`<ClientOnly>` 必须在 SSR 包裹层就加**，不能等到子组件里再包——否则父组件 vnode 已经成型。
- **Suspense + async setup** 服务端等待 resolve 后才 render；客户端 hydrate 时已 cached，不会 mismatch。
- **HTML 嵌套错位**永远要修：浏览器会自动纠正嵌套，但 Vue 警告无法放行——没有 `data-allow-mismatch="children"` 这种放行项。

## 排查清单（出现 hydration warning 时按序检查）

1. **是否用了 `new Date() / Math.random() / crypto.randomUUID()`**：换成 `useSSRContext` 注入固定值或 `<ClientOnly>` 包裹。
2. **是否依赖 `window` / `document` / `localStorage`**：用 `import.meta.client` 守卫。
3. **是否嵌套了 block-level 元素到 inline 元素**：`<p><div></div></p>` → 浏览器自动改 `<div><p></p></div>`，永远 mismatch。
4. **两端 `vue` 版本是否一致**：`pnpm why vue` 对比 server、client 输出。
5. **locale / timezone 配置**：两端 `process.env.TZ` 必须一致。
6. **是否被 `data-allow-mismatch` 显式放行**：检查模板里是否有这个 attribute。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://cn.vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch) | Hydration mismatch 完整指南 |
| [Vue 3.5 release](https://blog.vuejs.org/posts/vue-3-5) | data-allow-mismatch 引入 |
| [Vue 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/hydration.ts) | hydration 流程与 mismatch 处理 |
| [Vue 官方 API](https://cn.vuejs.org/api/ssr.html) | `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` |