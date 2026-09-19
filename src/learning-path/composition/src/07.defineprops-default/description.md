> 版本: Vue 3.x | RFC: 0003-script-setup | 状态: stable

# defineProps 默认值与类型推断

`<script setup>` 提供了基于类型的 props 声明宏 `defineProps<T>()`，让 props 既具备 TypeScript 静态校验，又能在运行时拿到完整的 prop 选项。

## 这是什么

`defineProps` 是 `<script setup>` 的编译时宏，它把一个类型字面量编译成运行时 props 选项对象。它同时支持：

- **TS 类型声明**：`defineProps<{ msg: string; count?: number }>()`
- **带默认值的运行时声明**：`defineProps({ msg: { type: String, required: true }, count: { type: Number, default: 0 } })`
- **二者混合**：使用 `withDefaults(defineProps<T>(), { ... })` 把类型声明与默认值合并

## Vue 怎么实现

源码核心位于 `packages/runtime-core/src/apiSetupHelpers.ts`，编译期宏由 `@vue/compiler-sfc` 改写：

- `packages/compiler-sfc/src/script/defineProps.ts` 把 TS 类型转译成 `props` 运行时选项（生成 `__props` 字段，调用 `createProps`）
- `packages/runtime-core/src/componentProps.ts` 中 `normalizePropsOptions` 负责 prop 选项归一化，校验 required、设置默认值（`getDevDefault`）

`withDefaults` 同样在 `script-setup` 编译期被识别，会把默认值与 TS 类型合并后再调用 `defineProps`。

## 实战中什么时候用 / 什么时候不用

**用**：

- 组件库、长期维护的业务组件，需要 TS 推断
- 跨包复用，要求 props 名称/类型稳定
- IDE 提示和重命名重构收益明显

**不用**：

- 单文件临时 demo、props 频繁变化的内部组件，写 `defineProps<...>()` 反而拖慢节奏
- 大量可选 props 都带默认值时，类型声明会很长，可考虑运行时声明

## 官方文档延伸阅读

- https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits (props 类型声明)
- https://cn.vuejs.org/guide/components/props.html (props 完整指南)
- https://github.com/vuejs/rfcs/discussion/502 (type-only props RFC)

## 常见踩坑

- 解构 `defineProps` 会丢失响应性，必须保留宏返回值整体
- TypeScript 的 `interface` 不能作为 `defineProps<T>()` 的实参，必须用**对象字面量类型**
- `withDefaults` 的默认值在 dev 与 prod 行为不同：dev 会调用工厂函数生成独立对象，避免共享引用

## 延伸阅读

- https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits
- https://cn.vuejs.org/guide/components/props.html#prop-validation
- https://github.com/vuejs/rfcs/discussion/502
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentProps.ts
- https://github.com/vuejs/core/blob/main/packages/compiler-sfc/src/script/defineProps.ts
- [Vue 源码洞察：validateProp 类型校验与 validator 调用顺序](_analysis/vue-source-insights.md#validateprop类型校验与validator调用顺序) | `packages/runtime-core/src/componentProps.ts:682-707` 引用
- [Vue 源码洞察：validatePropName 拒绝 $ 与 _ 开头的 prop 名](_analysis/vue-source-insights.md#validatepropname拒绝与开头的prop名) | `packages/runtime-core/src/componentProps.ts:617-625` 引用
