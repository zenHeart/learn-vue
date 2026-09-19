> **版本**：VueUse 10.x+ | **状态**：stable | **概念**：持久化状态到 storage

# VueUse useStorage / useLocalStorage / useSessionStorage

## 这是什么

`useStorage` 是 VueUse 持久化 ref 的基座函数，内部监听 `storage` 事件实现**跨标签同步**；`useLocalStorage` 和 `useSessionStorage` 是它的语法糖——前者写 `localStorage`，后者写 `sessionStorage`。三者都返回 `RemovableRef<T>`，可以像普通 ref 一样 `v-model`、`.value = ...`。

底层走 `useStorage(key, defaultValue, storage, options)`：第三个参数决定存储后端（`window.localStorage` / `window.sessionStorage` / 自定义 `Storage` 接口），所以同样的 API 能覆盖 IndexedDB / Cookie / AsyncStorage 等任意异步存储——只要给一个兼容 `{ getItem, setItem, removeItem }` 的对象。

## 实战配置

```ts
import { useStorage, useLocalStorage, useSessionStorage } from '@vueuse/core'

// 基础：自动持久化 ref
const token = useLocalStorage('auth.token', '')
const theme = useStorage<'light' | 'dark'>('app.theme', 'light')

// 自定义序列化（处理 Date、Map、Set、正则等不能 JSON.stringify 的类型）
const lastLogin = useStorage('user.lastLogin', new Date(), localStorage, {
  serializer: {
    read: (v) => v ? new Date(v) : new Date(),
    write: (v) => v.toISOString(),
  },
})

// sessionStorage：标签页关闭即失效
const draft = useSessionStorage('editor.draft', '')

// 同步默认值：第三个参数可省略，自动选 localStorage
const dark = useStorage('ui.dark', false)
```

完整源码参考 [`packages/core/useStorage/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorage/index.ts)——所有持久化 hook 都基于它实现。

## 源码走读

```ts
// packages/core/useStorage/index.ts
export function useStorage(key, defaults, storage = defaultStorage, options = {}) {
  const { listenToStorageChanges = true } = options
  // ... 注册 ref + 监听 storage 事件实现跨标签同步
}
```

默认值 `listenToStorageChanges = true`——这就是跨标签同步的开关。

## 跨标签同步的关键点

```ts
// A 标签
const token = useLocalStorage('token', '')
token.value = 'abc'

// B 标签（同源）
const token = useLocalStorage('token', '')
// token.value === 'abc' ✓ 自动同步
```

底层机制：原标签写 `localStorage.setItem` 后，浏览器会在**其他**标签里派发 `storage` 事件；`useStorage` 订阅这个事件并更新 ref。**写入自身不会触发同步**（这是浏览器规范），所以同一个 ref 的多次 `.value =` 是稳定的。

## 常见踩坑

- **序列化失败**：`localStorage.setItem` 只接受字符串。VueUse 默认走 `JSON.stringify`，所以 `Date`、`Map`、`Set`、`BigInt` 会被丢精度或炸掉——传 `serializer: { read, write }` 自己处理。
- **SSR 报错**：服务端没有 `window`。VueUse 内部走 `import.meta.client` 判断，SSR 时退化为只读 `ref(defaults)`；如果你需要在 SSR 持久化，得自定义 `storage` 参数指向服务端等价物。
- **跨标签不同步**：检查 `listenToStorageChanges` 是否被误关、是否在 iframe / `data:` URL 里（这种环境没有 storage 事件）。
- **隐私模式**：Safari / Firefox 隐私窗口下 `localStorage.setItem` 抛 `QuotaExceededError`——所有 `setItem` 调用要包 try/catch 或监听 `errorCaptured`。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [useStorage 官方文档](https://vueuse.org/core/useStorage/) | 完整 API 与 `listenToStorageChanges` 默认值 |
| [useLocalStorage 源码](https://github.com/vueuse/vueuse/blob/main/packages/core/useLocalStorage/index.ts) | 一行透传到 useStorage |
| [storage 事件规范](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event) | 跨标签同步的浏览器机制 |
| [相关 demo](./) | 06.vueuse-core 展示 useDebounceFn / useEventListener / useIntersectionObserver |
