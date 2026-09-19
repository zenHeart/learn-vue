# Reactive Props Destructure（Vue 3.5+）

> 版本：Vue 3.5+ | 状态：stable | 源码：`packages/compiler-sfc/src/script/defineProps.ts` | 延伸阅读：[Vue 官方：响应式 Props 解构](https://cn.vuejs.org/api/sfc-script-setup.html#reactive-props-destructure)

## 这是什么

Vue 3.5 之前 `<script setup>` 接收 props 后再解构会**丢失响应式**：

```ts
const { name } = defineProps<{ name: string }>()
// name 现在是普通字符串，与 props 解耦；watch 不到
```

Vue 3.5+ 编译器会把解构重写为 `props.name` 访问模式，从而保留响应式。配套提供 **`props.xxx` 仍然可用**；写 watch 时无需 `() => props.name` 包裹。

```ts
const { name = '默认' } = defineProps<{ name?: string }>()
watchEffect(() => console.log(name)) // 直接读取响应式
```

## 源码走读

```ts
// packages/compiler-sfc/src/script/defineProps.ts
// 编译器扫描 `const { x } = defineProps(...)`
// 把 x 的所有使用替换为 props.x，并在 setup 起始处注入 const props = ...
```

> 仅当解构变量**被读取**时（出现在 reactive 上下文），才插入 `props.x` 引用；非响应式上下文仍走本地副本（常量折叠）。

## 实战场景

1. 表单组件用解构 props 简化代码，又不丢失响应式；
2. 与 `computed` 组合写派生状态，无需 `() => props.x`；
3. `v-model` / `defineModel` 不再需要 `props.modelValue + emit('update:modelValue')` 的中转。

## 常见踩坑

- 解构时给默认值：`const { count = 0 } = ...`——值是**普通常量**，且改 props.count 不会反向影响默认值；
- 解构变量**不能重新赋值**（`const`）；如需赋值请用 `props.x = ...`（不推荐，prop 应为只读）；
- 编译器对未使用的解构变量**不做**重写——Vue 3.5 的优化器可静态分析。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方：Reactive Props Destructure](https://cn.vuejs.org/api/sfc-script-setup.html#reactive-props-destructure) | 编译器原理 |
| [Vue 3.5 发布说明](https://blog.vuejs.org/posts/vue-3-5) | 该特性首发版本 |
| [Vue 源码：compiler-sfc](https://github.com/vuejs/core/blob/main/packages/compiler-sfc/src/script) | defineProps 编译 |