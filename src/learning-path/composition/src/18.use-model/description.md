# useModel：函数式双向绑定 {#use-model}

> 版本: Vue 3.4+ | RFC: 0203-define-model | 状态: stable

`useModel(props, name, options?)` 是 `defineModel` 宏的**函数式底层 API**。当你在 `<script setup>` 之外需要双向绑定（例如纯函数组件、JSX / `defineComponent({ setup() {} })`）、或需要更细的修饰符控制时使用。

## API 签名 {#signature}

```ts
const model = useModel(props, 'modelValue', {
  localValue?: Ref<T>,         // 本地默认值（双向绑定前）
  transform?: (v: T) => T,     // 写入 emit 前转换
  event?: string,              // 默认 'update:modelValue'
})
```

返回 `WritableComputedRef<T>`：读 props，写时 emit。

## 与 defineModel 的关系 {#vs-defineModel}

| 维度 | `defineModel` 宏 | `useModel` 函数 |
| --- | --- | --- |
| 使用场景 | `<script setup>` 默认 | JSX / 非 setup / 运行时按需绑定 |
| 编译时 | 是（编译器改写） | 否（运行时） |
| 修饰符支持 | 通过 `modifiers` 参数自动派生 | 需手动管理 |
| 可在循环中调用 | 否（编译期限制） | 是 |

## 实战场景 {#production}

- **JSX 组件**：`setup(props, { emit }) { return () => <Child v-model={...} /> }`
- **动态多 model**：用 `useModel(props, key)` 在循环里给每个 prop 创建对应 writable computed。
- **修饰符**：拿 `props.modelModifiers` 自己处理 uppercase / number 等。

## 关键陷阱 {#pitfalls}

1. **`props` 必须是 setup 接收的第一个参数**（即响应式 proxy），不能传入普通对象。
2. **`event` 选项需与父组件 `v-model:xxx` 配套**，默认 `update:modelValue`。
3. **`transform` 只在父→子方向生效**（emit 时），子→父不做额外转换。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · useModel](https://vuejs.org/api/composition-api-helpers.html#usemodel)
- [Vue 官方文档 · defineModel](https://vuejs.org/api/sfc-script-setup.html#definemodel)
- [Vue 3 源码 · useModel.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiSetupHelpers.ts)
- [RFC 0203 defineModel](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0203-define-model.md)

<!-- description.md -->
