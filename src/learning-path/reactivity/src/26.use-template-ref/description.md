# useTemplateRef 字符串 ref 的现代化替代 {#use-template-ref}

> **版本**：Vue 3.5+ | **状态**：stable | **源码**：`packages/runtime-core/src/helpers/useTemplateRef.ts:1-58` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/composition-api-helpers.html#usetemplateref) | [RFC 557](https://github.com/vuejs/rfcs/discussions/557)

Vue 3.5 引入的 `useTemplateRef()` 用来替代 3.x 时代「`ref="el"` + `const el = ref(null)`」的字符串 ref 写法。它在编译期感知模板字符串字面量，能给出比 `ref<T | null>(null)` 更准确、不会因手抖写错的类型推断；同时保持字符串 key 与模板 `ref="..."` 一一对应的运行期语义。

## 这是什么 {#what}

```ts
// 3.5 之前
const inputEl = ref<HTMLInputElement | null>(null)
inputEl.value?.focus()

// 3.5+
const inputEl = useTemplateRef<HTMLInputElement>('inputRef')
inputEl.value?.focus()
```

区别有三：

1. **编译期校验**：模板里不存在的 `ref="xxx"` 会在 IDE/模板编译阶段给出提示。
2. **类型推断更窄**：不必显式声明 `| null`，使用点 `?.` 由 Vue 自己推导。
3. **字符串集中**：组件模板的 `ref="..."` 与 setup 里的 `useTemplateRef('...')` 形成显式契约。

## 源码走读 {#source}

核心实现只有十几行：

```ts
// packages/runtime-core/src/helpers/useTemplateRef.ts
export function useTemplateRef<T = unknown, Keys extends string = string>(
  key: Keys,
): Readonly<ShallowRef<T | null>> {
  const i = getCurrentInstance()
  const ref = shallowRef<T | null>(null)
  if (i) {
    let refs = i.refs as DataRef[]
    // ... 把 (key, ref) 写入 instance.refs，等待 renderer 设置时回调
  }
  return ref as Readonly<ShallowRef<T | null>>
}
```

实际赋值发生在 `packages/runtime-core/src/rendererTemplateRef.ts:24-58` 的 `setRef()`：组件 mount/update 时，编译器把模板里的字符串 ref 收集到 `instance.refs`，renderer 遍历时调用 `useRef('foo')` 拿到的 setter，把 DOM 节点 / 组件实例赋值给对应 ref。

## 实战场景 {#production}

1. **v-for 中收集子实例 / DOM**：`useTemplateRef` 不直接支持 v-for（key 是单个字符串），需要用 `ref` 配合函数 ref（`:ref="el => setItemRef(el, item.id)"`）攒成 `Map<id, Element>`。
2. **组件实例强类型**：配合 `useTemplateRef<InstanceType<typeof Child>>('childRef')` 直接拿到 `Child` 的方法签名。
3. **SSR 安全**：服务端 setup 期间 DOM 尚未生成；模板 ref 永远是 `null`，访问 `el.focus()` 前必须判空或放在 `onMounted` 回调里。

## 常见踩坑 {#pitfalls}

- 字符串 key 必须与模板中的 `ref="..."` **一字不差**；编译器不做语义猜测。
- `useTemplateRef` 不能塞进 `v-for`；用普通 `ref` 数组或 `Map` 收集。
- 拿到的 ref 是 `ShallowRef`，**不要**在里面存可代理对象后再触发 —— `.value` 写入不会通知视图。
- 不要忘记 `onMounted` 守卫：模板 ref 在 setup 同步阶段还未挂载。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/composition-api-helpers.html#usetemplateref) | API 文档 |
| [RFC 557](https://github.com/vuejs/rfcs/discussions/557) | useTemplateRef 设计讨论 |
| [Vue 源码 · useTemplateRef.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helpers/useTemplateRef.ts) | 入口实现 |
| [Vue 源码 · rendererTemplateRef.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/rendererTemplateRef.ts) | `setRef` 实际赋值 |
| [Vue 源码洞察：模板 ref 在 v-for 中的收集顺序与异步包装](_analysis/vue-source-insights.md#模板-ref-在-v-for-中的收集顺序与异步包装) | 隐式经验 |