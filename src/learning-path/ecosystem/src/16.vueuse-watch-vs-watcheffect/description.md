> **版本**：VueUse 10.x+ | **状态**：stable | **概念**：watch 的语义变体

# VueUse watchDebounced / watchThrottled / watchOnce / watchPausable

## 这是什么

Vue 3 的 `watch` 是**立即 flush**（默认 `'pre'`）的；VueUse 围绕它做了一组语义化变体，覆盖「我希望它响应但不要那么频繁」「我只想响应一次」「我想暂停」这类高频场景。本节四个 hook 是组合工具里出场率最高的。

| Hook | 行为 |
|---|---|
| `watchDebounced(source, cb, { debounce: 500, maxWait? })` | 静默期后触发；`maxWait` 强制上限 |
| `watchThrottled(source, cb, { throttle: 500, trailing?, leading? })` | 固定频率触发；可关首尾 |
| `watchOnce(source, cb, options?)` | 仅触发一次（与 `{ once: true }` 行为一致但 API 更顺手） |
| `watchPausable(source, cb)` | 返回 `{ stop, pause, resume, isActive }` 控制器 |

## 实战配置

```ts
import { watchDebounced, watchThrottled, watchOnce, watchPausable } from '@vueuse/core'

// 搜索框防抖 300ms（默认 trailing）
const keyword = ref('')
watchDebounced(keyword, async (q) => {
  results.value = await fetch(`/api/search?q=${q}`).then(r => r.json())
}, { debounce: 300, maxWait: 1000 })

// 滚动节流 100ms
watchThrottled(scrollY, (y) => {
  saveScrollPosition(y)
}, { throttle: 100, trailing: true })

// 用户登录后只弹一次欢迎
watchOnce(user, (u) => {
  if (u) showWelcome(u.name)
})

// 窗口大小变化，按需暂停（路由切换时）
const { pause, resume, isActive } = watchPausable(
  windowSize,
  ([w, h]) => layoutStore.update({ w, h })
)
onBeforeRouteLeave(() => pause())
onAfterRouteEnter(() => resume())
```

## 源码走读

```ts
// packages/shared/watchDebounced/index.ts（简化）
export function watchDebounced(source, cb, options = {}) {
  const { debounce = 0, maxWait } = options
  return watchWithFilter(source, cb, (invoke) => {
    return createFilterWrapper(
      debounceFilter(debounce, { maxWait }),
    )(invoke)
  })
}
```

本质上是 `watch + debounceFilter` 的复合——VueUse 把所有 watch 变体都用 `watchWithFilter` 串起来。

## 选型对照

| 场景 | 用 |
|---|---|
| 输入框搜索 | `watchDebounced` |
| 拖拽期间实时跟随 | `watchThrottled`（`leading: true`） |
| 拖拽结束后保存最终位置 | `watchDebounced`（`debounce: 300`） |
| 用户首次访问展示引导 | `watchOnce` |
| 后台标签页 / 路由切换暂停上报 | `watchPausable` |
| 复杂组合（如节流 + maxWait） | `watchThrottled({ throttle, trailing, leading })` |

## 常见踩坑

- **`flush` 行为**：watchDebounced 内部 flush 用 `'sync'`——不要假设 `await nextTick()` 后能看到结果，要 `await new Promise(r => setTimeout(r, debounce))`。
- **`maxWait` 缺失**：连续拖拽场景下 debounce 会无限推迟，必须配 `maxWait` 设上限。
- **首尾都触发**：`throttle({ trailing: true })` 是默认值；如果不要 trailing 关掉。
- **flush timing 与 watch 不同**：VueUse 的 watch 变体用 `createFilterWrapper` 在回调前后过滤，行为更接近 `watch(..., { flush: 'sync' })`，写测试时按同步模型思考。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [watchDebounced 文档](https://vueuse.org/shared/watchDebounced/) | maxWait 与 flush 细节 |
| [watchWithFilter 源码](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchWithFilter/index.ts) | 所有变体的基础 |
| [相关 demo](./) | 06.vueuse-core 包含 useDebounceFn 的更基础演示 |
