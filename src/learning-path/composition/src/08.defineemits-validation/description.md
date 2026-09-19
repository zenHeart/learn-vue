> 版本: Vue 3.x | RFC: 0003-script-setup | 状态: stable

# defineEmits 事件声明与运行时校验

`defineEmits<{(e: 'change', value: number): void}>()` 是 `<script setup>` 中的事件声明宏，使用 TS 函数字面量类型描述事件签名。它在编译期生成 `emits` 运行时选项，从而开启：

1. 事件名校验：组件若触发未声明的事件，会在 dev 模式打印 `[Vue warn]`
2. 参数类型校验：与 props 类似，可以在运行时检查参数类型

## 这是什么

`defineEmits` 返回一个 `emit` 函数，调用 `emit('change', 42)` 会按声明类型校验参数；缺字段 / 多字段都会触发警告。它和 `defineProps` 一样，是编译期宏，运行期映射为 `component.emits` 选项。

## Vue 怎么实现

源码位于 `packages/runtime-core/src/apiSetupHelpers.ts` 与 `componentEmits.ts`：

- `compiler-sfc/src/script/defineEmits.ts` 把 TS 函数字面量类型转译成 `{ change: (value: number) => true | null }` 风格的 emits 选项
- `packages/runtime-core/src/componentEmits.ts` 的 `emit` 实现中调用 `validateEmit` 对照声明进行参数与类型校验

返回值 `emit` 在 Vue 3 中具备 **类型推断**能力：基于声明签名推断参数列表，IDE 中调用 `emit('change', 1)` 提示 `number`。

## 实战中什么时候用 / 什么时候不用

**用**：

- 公共组件、组件库，要求对外事件契约稳定
- 用 v-model 时必须声明 `update:modelValue`，否则 dev 模式会警告

**不用**：

- 内部玩具组件，事件频繁变化时类型同步是负担
- 一次性 demo，避免冗余样板

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/components/events.html (事件完整指南)
- https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits
- https://github.com/vuejs/rfcs/discussion/502

## 常见踩坑

- 触发未声明事件：dev 模式打印警告，但事件仍会向上传递（root listener 仍可接收），只用于 debug，不阻断运行
- 触发 `update:modelValue` 但未声明会触发额外的 v-model 警告
- TS 类型签名 `(e: 'change', v: number) => void` 中 `void` 是必需的，否则会被推断为 `unknown`
- 多个 payload 类型可用 union：`v: number | string`

## 延伸阅读

- https://cn.vuejs.org/guide/components/events.html
- https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits
- https://github.com/vuejs/rfcs/discussion/502
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentEmits.ts
- https://github.com/vuejs/core/blob/main/packages/compiler-sfc/src/script/defineEmits.ts
- [Vue 源码洞察：编译时 v-on 自动注册事件 vs 显式 emits](_analysis/vue-source-insights.md#编译时v-on自动注册事件vs显式emits) | `packages/runtime-core/src/componentEmits.ts:131-160` 引用
- [Vue 源码洞察：validatePropName 拒绝 $ 与 _ 开头的 prop 名](_analysis/vue-source-insights.md#validatepropname拒绝与开头的prop名) | `packages/runtime-core/src/componentProps.ts:623-630` 引用
