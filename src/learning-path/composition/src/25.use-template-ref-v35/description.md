# useTemplateRef 类型推断与组件实例 {#use-template-ref-v35}

> **版本**：Vue 3.5+ | **状态**：stable | **源码**：`packages/runtime-core/src/helpers/useTemplateRef.ts:1-58` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/composition-api-helpers.html#usetemplateref) | [Vue 3.5 changelog](https://github.com/vuejs/core/blob/main/CHANGELOG.md)

与 `reactivity/26.use-template-ref`（聚焦 DOM 元素的字符串 ref 替代）不同，本 demo 聚焦 **useTemplateRef 拿组件实例**时的强类型推断能力：

- 模板里写 `<Counter ref="counterRef" />`，setup 里写 `useTemplateRef<InstanceType<typeof Counter>>('counterRef')` —— IDE 自动补全所有 `defineExpose` 暴露的方法。
- 子组件**未** `defineExpose` 时，`counterRef.value` 会被推断为 `{}`；调用其方法就是「未声明属性 + 类型 any」 —— 这是 Vue 组件封装的关键约束。
- 与「import 组件类型 + ref<InstanceType<...>>」对比，写法更短，且不依赖 `ref` 的类型参数。

## 这是什么 {#what}

```vue
<!-- Child.vue -->
<script setup lang="ts">
const count = ref(0)
defineExpose({ add() { count.value++ }, reset() { count.value = 0 } })
</script>
```

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import Child from './Child.vue'

const counterRef = useTemplateRef<InstanceType<typeof Child>>('counterRef')
counterRef.value?.add()      // ✅ 类型安全，自动补全 add / reset
counterRef.value?.nonexistent() // ❌ 类型错误：属性不存在
</script>
```

## 源码走读 {#source}

`useTemplateRef` 本身只负责创建 `shallowRef` 并塞进 `instance.refs`：

```ts
// packages/runtime-core/src/helpers/useTemplateRef.ts
export function useTemplateRef<T = unknown, Keys extends string = string>(
  key: Keys,
): Readonly<ShallowRef<T | null>> {
  const i = getCurrentInstance()
  const ref = shallowRef<T | null>(null)
  if (i) {
    let refs: DataRef[] = (i.refs as DataRef[]) || []
    refs.push({ __v_isRef: true, get value() { return ref.value }, set value(v) { ref.value = v }, ... })
    i.refs = refs
  }
  return ref
}
```

**类型参数 `T` 是 IDE 推断的唯一支撑**：它不会在运行时做任何检查，纯粹是给 TypeScript 用的「占位」。

## 实战场景 {#production}

1. **命令式调子组件**：打开命令面板、聚焦子组件的输入框、触发表单提交。
2. **跨组件库集成**：第三方组件库暴露的 `defineExpose` API 直接拿，省去「ref<TypedComponent> + 类型断言」模板代码。
3. **构建类型安全的命令式 helper**：封装 `function focusFirstField(formRef) { formRef.value?.firstInput?.focus() }`，全部类型从 `useTemplateRef` 顺流而下。

## 常见踩坑 {#pitfalls}

- **`useTemplateRef` 不会强约束** `defineExpose`：子组件没 `defineExpose` 时类型可能是 `{}`（因为 `setup` 返回的对象被默认暴露），但严格模式下应通过显式 `defineExpose` 列出方法。
- **`useTemplateRef<T>` 与 `<script setup>` 的隐式暴露冲突**：在 `<script setup>` 下，未 `defineExpose` 时实例是「PublicFields」，类型上仍是 `{}`，运行时访问会得到 `undefined`。
- **跨项目类型共享**：把 `InstanceType<typeof Child>` 提取成 `export type ChildInstance = InstanceType<typeof Child>` 后，可同时在父组件和 helper 函数里复用。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/composition-api-helpers.html#usetemplateref) | API 文档 |
| [Vue 源码 · useTemplateRef.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helpers/useTemplateRef.ts) | 入口实现 |
| [Vue 源码洞察：useTemplateRef 与 defineExpose 的契约](_analysis/vue-source-insights.md#usetemplateref-defineexpose) | 隐式经验 |
| [Vue 3.5 changelog](https://github.com/vuejs/core/blob/main/CHANGELOG.md) | 引入版本与发布说明 |