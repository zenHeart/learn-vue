# KeepAlive :max 与 LRU 淘汰 {#keepalive-max-lru}

> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/components/KeepAlive.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/guide/built-ins/keep-alive.html#max-cached-instances)

`<KeepAlive :max="N">` 缓存最近的 N 个组件实例；当新实例进入时，最久未使用的实例会被销毁（LRU，Least Recently Used）。

- 命中缓存时组件的 `onMounted` 不再触发，但 `onActivated` 会触发。
- 实例被淘汰时 `onDeactivated` 先触发，然后 `onUnmounted`。

## 这是什么 {#what}

```vue
<KeepAlive :max="3">
  <component :is="current" :key="current" />
</KeepAlive>
```

LRU 替换策略：访问 = 命中缓存或新挂载；超过 max 时把「最久未被访问」的实例淘汰。

## 源码走读 {#source}

```ts
// packages/runtime-core/src/components/KeepAlive.ts
const cache = new Map()      // key → vnode
const keys = new Set()       // LRU 顺序

function pruneCacheEntry(key) {
  // 触发 onDeactivated → unmount
  cache.delete(key)
  keys.delete(key)
}

// 命中缓存时：把 key 移到 Set 末尾（最近使用）
function touch(key) {
  keys.delete(key)
  keys.add(key)
}

// 挂载新组件时若超出 max，淘汰最久未使用
if (max && keys.size > max) {
  pruneCacheEntry(keys.values().next().value)
}
```

关键事实：

- **LRU 是基于「访问顺序」**：每次命中（activate）或挂载新组件都把对应 key 移到 Set 末尾；Set 头部就是最久未使用的。
- **缓存 key 来源**：组件名（`componentName` / `__name`）；匿名组件（无 name）不会被缓存。
- **淘汰时仍触发 `onDeactivated` 与 `onUnmounted`**：与手动切换缓存不同之处仅在自动触发。
- **`:include` / `:exclude` 与 `:max` 组合**：先按 include/exclude 过滤匹配，再判断是否超 max 触发 LRU。

## 实战场景 {#production}

1. **多 Tab 切换**：表单 A / 表单 B / 表单 C，缓存每个 Tab 的输入状态 —— `:max="3"`。
2. **步骤向导**：Step 1 → 5 切换，保留每步已填字段 —— 用 `:include` 配合 max。
3. **路由视图缓存**：`RouterView` + `<KeepAlive :max="5">` —— 防止用户反复切换时丢失列表滚动位置 / 表单状态。
4. **Tab 多页签**：浏览器式多页签，max = 10 防止内存爆炸。

## 常见踩坑 {#pitfalls}

- **组件必须命名**：匿名组件（`defineComponent({ setup() {} })`）不会被缓存；务必给 `name` 选项或 `<script setup>` 顶层 `defineOptions({ name: 'X' })`。
- **`onActivated` / `onDeactivated` 触发条件**：仅当组件在 `<KeepAlive>` 内且确实被 activate / deactivate 时触发 —— 首次挂载也走 `onActivated`（在 `onMounted` 之后）。
- **DOM 节点不卸载**：被缓存的实例的 DOM 节点保留；状态不会重置，仅 `onActivated` 触发，**注意 `setup` 不会重新执行**。
- **max 太小时状态丢失**：LRU 淘汰意味着切到 A → B → C → A 时 A 的状态可能已被淘汰（因为 max 不足）。
- **生命周期顺序**：手动切换 vs LRU 淘汰，钩子顺序都是 `deactivated → unmounted`；手动 unmount 不会触发 `deactivated`。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/guide/built-ins/keep-alive.html) | KeepAlive 文档 |
| [Vue 官方 · max](https://vuejs.org/api/built-in-components.html#keepalive) | API |
| [Vue 源码 · KeepAlive.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/KeepAlive.ts) | 实现 |
| [LRU 算法](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)) | LRU 背景 |
| [`advanced/23.keepalive-hooks`](#) | 配套：钩子机制 |
| [`advanced/24.on-activated-on-deactivated`](#) | 配套：钩子时机 |
