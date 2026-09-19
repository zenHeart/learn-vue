# defineModel 深度选项：transform / debounce / get / set {#v-model-deep-options}

> **版本**：Vue 3.4+ | **状态**：stable | **源码**：`packages/runtime-core/src/helpers/useModel.ts`、`packages/compiler-sfc/src/script/defineModel.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/sfc-script-setup.html#definemodel) | [RFC 503](https://github.com/vuejs/rfcs/discussions/503)

`defineModel()` 的第二个参数在 3.4+ 提供完整转换与处理能力：

- **`get(value)`**：从父组件读到的原始值如何映射为组件内的 ref 值。
- **`set(value)`**：组件内 ref 写入时如何转换为 emit 的值。
- **`local: true`**：脱离父组件的非受控本地 prop（已覆盖于 `09.defineModel`）。
- **`modifiers`**：消费父组件的 `v-model.xxx` 修饰符。

> 注意：内置选项里**没有** debounce/throttle —— 这些是常见需求，由 `set` 中调用自定义 debounce 函数实现。

## 这是什么 {#what}

```ts
// 基础形式
const title = defineModel<string>('title', { default: '' })

// get/set 转换
const num = defineModel<number | string>('count', {
  default: 0,
  get(v) {
    return typeof v === 'number' ? v * 2 : v
  },
  set(v) {
    if (typeof v === 'string') {
      const n = parseFloat(v)
      return Number.isFinite(n) ? n : v
    }
    return v
  },
})

// 消费父组件修饰符
const text = defineModel<string>('text', {
  modifiers: { trim: true, number: false, lazy: false },
  set(v) {
    return modifiers.trim ? v.trim() : v
  },
})
```

## 源码走读 {#source}

```ts
// packages/runtime-core/src/helpers/useModel.ts
export function useModel(props, name, options?) {
  const { get, set } = options ?? {}
  return customRef((track, trigger) => ({
    get() {
      let v = props[name]
      if (get) v = get(v)
      track()
      return v
    },
    set(v) {
      const next = set ? set(v) : v
      trigger()
      emit(`update:${name}`, next)
    },
  }))
}
```

关键事实：

- **底层用 `customRef` + `watchSyncEffect`**：不是 `computed`，每次 set 同步触发 `emit('update:xxx', next)`。
- **`get` 在父组件 prop 变化时调用**：`customRef` 的 get 是同步的，因此 prop 变 → ref 重读 → 触发响应式更新。
- **`set` 必须返回 emit 的值**：返回 undefined 不会 emit（仍触发 track/trigger 但不发事件）。
- **修饰符由父组件传入**：父组件写 `v-model.trim="x"` 时，编译器把修饰符作为 `modifiers: { trim: true }` 传给子组件。

## 实战场景 {#production}

1. **数字输入框**：`.number` 在子组件 set 中实现，父组件拿到的就是 number。
2. **延迟搜索**：`debounce` 包在 set 中，输入后 300ms 才触发 emit。
3. **字符串清洗**：`.trim` 修饰符 + set 中 trim。
4. **数据格式转换**：父组件传 ISO 日期字符串，子组件 get 转 Date 对象。

## 常见踩坑 {#pitfalls}

- **`get` 不应修改 props**：get 是只读转换，副作用会破坏响应式追踪。
- **`set` 必须返回值**：`return undefined` 等价于不发 update 事件；想保留原值就 `return v`。
- **修饰符消费不彻底**：父组件写 `v-model.trim`，子组件必须主动消费 `modifiers.trim` —— 默认不会自动 trim。
- **类型推断**：defineModel 第二个参数会被推导成 `WritableComputedRef`；多 defineModel 时同名 prop 报重复。
- **local 与 modifiers 互斥**：`local: true` 时父组件不绑定 prop，modifiers 也无意义。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/sfc-script-setup.html#definemodel) | defineModel API |
| [Vue 官方 · 3.4 更新日志](https://blog.vuejs.org/posts/vue-3-4) | defineModel 增强 |
| [RFC 503](https://github.com/vuejs/rfcs/discussions/503) | defineModel 提案 |
| [Vue 源码 · useModel.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helpers/useModel.ts) | useModel 实现 |
| [Vue 源码 · defineModel 编译器](https://github.com/vuejs/core/blob/main/packages/compiler-sfc/src/script/defineModel.ts) | 编译器入口 |
| [`composition/09.defineModel`](#) | 基础用法配套 |
