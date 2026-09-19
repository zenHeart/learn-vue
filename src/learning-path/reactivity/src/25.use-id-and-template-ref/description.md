> **版本**：Vue 3.5+ | **状态**：stable | **源码**：`packages/runtime-core/src/helpers/useId.ts`、`packages/runtime-core/src/helpers/useTemplateRef.ts` | **延伸阅读**：[Vue 官方 · useId](https://cn.vuejs.org/api/composition-api-helpers.html#useid)、[Vue 官方 · useTemplateRef](https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref)

# Vue 3.5 `useId()` 与 `useTemplateRef()`

## 这是什么

Vue 3.5 起新增两个组合式 API：

- **`useId()`**：返回组件实例唯一的稳定 ID，用于 SSR hydration 时客户端 / 服务端的 ID 一致。
- **`useTemplateRef(key)`**：返回 `shallowRef<HTMLElement | null>`，与模板上的 `ref="key"` 桥接。

源码 `useId.ts`：

```ts
export function useId(): string {
  const i = getCurrentInstance()
  if (i) {
    return (i.appContext.config.idPrefix || 'v') + '-' + i.ids[0] + i.ids[1]++
  }
  // ...
}
```

`useTemplateRef.ts`：

```ts
export function useTemplateRef<T = unknown, Keys extends string = string>(
  key: Keys,
): TemplateRef<T> {
  const i = getCurrentInstance()
  const r = shallowRef(null)
  if (i) {
    const refs = i.refs === EMPTY_OBJ ? (i.refs = {}) : i.refs
    Object.defineProperty(refs, key, {
      enumerable: true,
      get: () => r.value,
      set: val => (r.value = val),
    })
  }
  // ...
  return ret
}
```

## SSR Hydration

`useId()` 的关键设计：**同一个组件实例在服务端和客户端返回同样的 ID**。

- 服务端：渲染 HTML `<input id="v-0-1">`
- 客户端：hydration 时 useId 再次调用也返回 `"v-0-1"`
- 不会因为时间戳 / 随机数导致不匹配

`useTemplateRef` 在 hydration 期间：**模板 ref 不会立即被赋值**——要等 patch 完成（post 队列），所以 SSR 渲染时通常配合 `useId` 一起使用。

## 实战场景

1. **表单 label/input 配对**：`useId()` 给 `<label for>` 和 `<input id>` 自动生成匹配 ID。
2. **多个同组件实例**：`<FormField />` 在页面中出现 10 次，每次 useId 都不同。
3. **`<keep-alive>` 内的 ref**：避免在 keep-alive 子组件被激活时 ref 指向 stale 元素。

## 常见踩坑

- **`useTemplateRef` 返回值**：默认 `Readonly<ShallowRef<T | null>>`；3.5 之前返回 `Ref<T | null>`，3.5+ 已**改为只读**——不要尝试赋值。
- **`ref="key"` 字符串 ref 仍可用**：3.5 没废弃字符串 ref，但 `useTemplateRef` 类型推断更精准。
- **`useId()` 在 setup 之外调用**返回空字符串 + 警告；不能放在异步分支内（instance 可能已 null）。
- **`useTemplateRef` 与字符串 ref 重复**：同一个 key 既写 `ref="foo"` 又写 `useTemplateRef('foo')`，后者会 warning + 拒绝覆盖 setupState 的 foo（见 useTemplateRef.ts:17）。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · useId](https://cn.vuejs.org/api/composition-api-helpers.html#useid) | API 文档 |
| [Vue 官方 · useTemplateRef](https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref) | API 文档 |
| [Vue 3.5 发布说明](https://blog.vuejs.org/posts/vue-3-5) | 3.5 新特性总览 |
| [Vue 源码 · useId.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helpers/useId.ts) | ID 生成逻辑 |
| [Vue 源码 · useTemplateRef.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helpers/useTemplateRef.ts) | shallowRef 桥接 |

<!-- description.md -->
