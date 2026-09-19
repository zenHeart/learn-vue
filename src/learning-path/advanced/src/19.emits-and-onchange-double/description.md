> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/componentEmits.ts:121-153, 195-213` | **延伸阅读**：[Vue 官方 · 组件事件](https://cn.vuejs.org/guide/components/events.html)

# `emits` + `props.onChange` 双触发陷阱

## 这是什么

Vue 3 引入 `emits` 选项是为了**同时支持两种组件事件风格**：

1. **显式声明（推荐）**：`emits: ['change']` → `setup` 内 `emit('change', ...)` → 父级 `@change="..."`。
2. **隐式属性（Vue 2 兼容）**：父级直接传 `onChange` 当 prop，子组件内 `props.onChange(...)` 调用。

如果**同时声明** `emits: ['change']` **又**读取 `props.onChange`——同一个事件会触发两次：

```ts
// 子组件
const props = defineProps<{ onChange?: (v: string) => void }>()
const emit = defineEmits<{ change: [v: string] }>()

function fire(v: string) {
  emit('change', v)               // ① 走 emits 路径，调用 props.onChangeChange 或 props.onChange
  props.onChange?.(v)             // ② 显式再调一次 props.onChange
}
```

## 源码走读

`componentEmits.ts:195-213`：

```ts
let handlerName
let handler =
  props[(handlerName = toHandlerKey(event))] ||           // 'change' → 'onChange'
  props[(handlerName = toHandlerKey(camelize(event)))]    // 兼容 camelCase
if (handler) {
  callWithAsyncErrorHandling(handler, instance, ErrorCodes.COMPONENT_EVENT_HANDLER, args)
}
```

也就是说 **emit('change', v)** 已经被 Vue 翻译成 **调用 props.onChange**——然后你又主动调用 `props.onChange?.(v)`，相当于重复执行同一函数两次。

更糟的是，如果父级只用了 `@change="onChange"`，**没有**传 `onChange` prop——Vue 编译器/模板编译器会把 `@change="onChange"` 翻译成 `vnode.props.onChange`（即子组件 props 上的 `onChange` 属性）。`emit` 内部走 `props[handlerName]` 查找（line 197-199），找到的是**同一个 `onChange` 函数引用**。你**主动**调 `props.onChange?.()` 仍指向同一个 handler，加上 `emit` 自己触发一次，加起来两次。

## 与 Vue 2 兼容写法对比

| 写法 | Vue 2 | Vue 3 |
|---|---|---|
| 子：`this.$emit('change', v)` | 父 `@change` | 父 `@change` |
| 子：`this.$emit('change', v)` + 子：`props.onChange?.(v)` | 不会重复（emits 直接派发到父） | **会重复**（emit 也调用 props.onChange） |

也就是说：**Vue 2 的"props.onChange 作 fallback"模式在 Vue 3 中是 bug 来源**。Vue 3 应当只用 emits。

## 实战场景

1. **重构旧组件**：从 Vue 2 升级到 Vue 3 时，删除 `props.onChange?.()` 的 fallback 调用，全部走 `emit`。
2. **写组件库**：永远只用 `defineEmits`，让 TypeScript 类型推导帮你校验父级 handler 签名。
3. **dev 模式下**：开启 `app.config.errorHandler`，双触发会被 `callWithAsyncErrorHandling` 包装——可以监控重复 emit。

## 常见踩坑

- **`.once` 修饰符**：`emits` 自动支持 `props[handlerName + 'Once']`，所以 Vue 2 的 `v-on:change.once` 在 Vue 3 仍然能工作，但只能通过 `@change.once` 实现，不要手动调用 `.once`。
- **大小写**：`emit('change')` 在模板 `@change="..."` 监听；`emit('Change')` 在模板 `@change="..."` 监听——因为 HTML 不区分大小写，**emit 和监听都要用 kebab-case**。
- **`onChangeOnce`**：emit 时 Vue 会同时检查 `onChangeOnce`（用于 `v-on:change.once`）。如果父级同时声明 `@change` 和 `@change.once`，emit 只触发一次 `@change.once`。
- **不要混用 `defineEmits` 和 props.onChange**：要么纯 emits（推荐），要么纯 props 函数（仿 React 风格），不要两者兼得。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · 组件事件](https://cn.vuejs.org/guide/components/events.html) | 事件声明与触发 |
| [Vue 官方 · defineEmits](https://cn.vuejs.org/api/sfc-script-setup.html#defineemits) | SFC 写法 |
| [Vue 源码 · componentEmits.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentEmits.ts) | emit 函数实现 |
| [Vue Migration · v-on 修饰符](https://v3-migration.vuejs.org/breaking-changes/v-on.html) | Vue 2 → 3 事件变化 |

<!-- description.md -->
