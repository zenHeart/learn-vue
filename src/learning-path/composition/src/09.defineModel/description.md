> 版本: Vue 3.4+ | RFC: 0008-define-model | 状态: stable (3.4+)

# defineModel 双向绑定宏

`defineModel()` 是 Vue 3.4 引入的编译期宏，它把 `props + emit('update:xxx')` 的样板代码封装为一行的可读写 ref。

## 这是什么

`const title = defineModel<string>('title', { default: '' })` 等价于：

```ts
const props = defineProps<{ title?: string }>()
const emit = defineEmits<{ (e: 'update:title', v: string): void }>()
const title = computed({
  get: () => props.title ?? '',
  set: (v) => emit('update:title', v),
})
```

返回的对象是一个 `WritableComputedRef`，可以直接用于 `v-model` 或读写。

## Vue 怎么实现

- RFC: <https://github.com/vuejs/rfcs/discussions/503>
- 编译器入口：`packages/compiler-sfc/src/script/defineModel.ts`
- 运行时入口：`packages/runtime-core/src/apiSetupHelpers.ts` 的 `useModel`，内部用 computed 包裹 props + emit
- 文档：<https://cn.vuejs.org/api/sfc-script-setup.html#definemodel>

`defineModel` 的第二个参数支持：

- `local`: true 时表示这是一个非受控的本地 prop
- `default`: 当父组件不传时的默认值（dev 模式下要求非 required 时必须）
- modifiers：默认声明 `trim` / `number` / `lazy`，但需要主动消费

## 实战中什么时候用 / 什么时候不用

**用**：

- 表单组件封装、UI 库，需要 v-model 行为
- 想避免 `props + emit` 的样板代码

**不用**：

- 只读 prop：`defineProps` 即可
- 自定义事件名（非 update:* ）：仍是 `defineEmits`

## 常见踩坑

- `defineModel()` 不传名字时，model 名为 `modelValue`
- 同一个组件多次 `defineModel('a')`、`defineModel('b')` 会对应 `v-model:a` / `v-model:b`
- modifiers 是按字符串数组传递：`defineModel('title', { modifiers: { trim: true } })`，需要自行在 setter 中读取

## 延伸阅读

- https://cn.vuejs.org/api/sfc-script-setup.html#definemodel
- https://github.com/vuejs/rfcs/discussions/503
- https://cn.vuejs.org/guide/components/v-model.html
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiSetupHelpers.ts
- https://github.com/vuejs/core/blob/main/packages/compiler-sfc/src/script/defineModel.ts
- [Vue 源码洞察：patchProp 中 v-model 监听被忽略](_analysis/vue-source-insights.md#patchprop中v-model监听被忽略) | `packages/runtime-dom/src/patchProp.ts:28-32` 引用
