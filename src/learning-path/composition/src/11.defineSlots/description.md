> 版本: Vue 3.3+ | RFC: 0007-define-slots | 状态: stable (3.3+)

# defineSlots 插槽类型宏

`defineSlots` 是 3.3 引入的编译期宏，用于给 `<slot>` 节点绑定类型签名。它与运行时 `useSlots()` 返回值的类型协同工作：编译器把类型签名同时注入到 `$slots` 上，让消费者可以享受 IDE 类型提示与空值保护。

## 这是什么

```ts
defineSlots<{
  default(props: { item: string }): any
  header(): any
  footer(props: { meta: { len: number } }): any
}>()
```

等价于：

```ts
const slots = useSlots()
slots.default  // 类型： ((props: { item: string }) => any) | undefined
slots.header   // 类型： (() => any) | undefined
```

`defineSlots` 不接受运行时实参，只接受类型实参；返回的对象与 `useSlots()` 行为一致，但带类型。

## Vue 怎么实现

- 编译器：`packages/compiler-sfc/src/script/defineSlots.ts` 把宏调用转换为一个空函数，类型信息注入 `__slots` 类型上，从而让 `$slots` 类型推断生效
- 运行时：`useSlots()`（`packages/runtime-core/src/componentSlots.ts`）读取 `instance.slots`
- 没有运行时开销，因为类型在编译期就被擦除

## 实战中什么时候用 / 什么时候不用

**用**：

- 组件库、强类型协作，插槽参数必须稳定
- 把插槽当作 props 一样写接口文档

**不用**：

- 一次性临时组件 / 内部使用，类型收益小于维护成本
- 模板中的 `<slot>` 不带参数时，无需 defineSlots

## 官方文档延伸阅读

- https://cn.vuejs.org/api/sfc-script-setup.html#defineslots
- https://cn.vuejs.org/guide/components/slots.html
- https://github.com/vuejs/rfcs/discussions/502

## 常见踩坑

- `defineSlots` 必须在 `<script setup>` 顶层调用，不能写在函数内
- 类型签名里参数名与默认值：在 Vue 3.3 仅类型签名，运行时仍按 `<slot :foo="bar">` 实际绑定传值
- 与 `useSlots()` 同时使用：`defineSlots` 仅提供类型，运行时数据请用 `useSlots()`

## 延伸阅读

- https://cn.vuejs.org/api/sfc-script-setup.html#defineslots
- https://cn.vuejs.org/guide/components/slots.html
- https://github.com/vuejs/rfcs/discussions/502
- https://github.com/vuejs/core/blob/main/packages/compiler-sfc/src/script/defineSlots.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentSlots.ts
- [Vue 源码洞察：defineOptions / defineSlots 宏的编译器展开](_analysis/vue-source-insights.md#defineoptions--defineslots宏的编译器展开) | `packages/compiler-sfc/src/script/defineOptions.ts:18-72` 引用
