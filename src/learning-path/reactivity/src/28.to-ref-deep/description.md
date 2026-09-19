# toRef：把对象的某个字段桥接到 ref {#to-ref-deep}

> **版本**：Vue 3.3+ | **状态**：stable | **源码**：`packages/reactivity/src/ref.ts:483-510` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/reactivity-utilities.html#toref) | [RFC 232](https://github.com/vuejs/rfcs/discussions/346)

`toRef(obj, 'key')` 与 `toRef(() => obj.key)` 是同一 API 的两种重载：把「响应式对象的某个属性」或者「任意 getter 返回值」包装成一个**双向可写**的 ref。它跟 `toRefs` 的区别是：**toRefs 一次性拆多个字段、值随原对象同步；toRef 只针对单个字段，且第二种重载可以包装未声明为 ref 的纯 getter**。

## 这是什么 {#what}

```ts
const state = reactive({ count: 0, name: 'vue' })

// 重载一：把 reactive 对象的某字段拆成 ref
const count = toRef(state, 'count')
count.value++   // state.count 也会变成 1
state.count++   // count.value 同步变成 2

// 重载二：getter 形式，包任意表达式
const lengthRef = toRef(() => state.name.length)
lengthRef.value  // 4（且会收集依赖、触发响应式更新）
```

要点：

- 返回的 ref **不是新值**，是原值的代理 —— 修改 ref 即修改原对象。
- getter 形式即使包的是普通函数，调用 `lengthRef.value` 时也会被 reactive 系统收集依赖、并在依赖变化时触发更新。

## 源码走读 {#source}

```ts
// packages/reactivity/src/ref.ts:483-510
export function toRef<T extends object, K extends ToRefKey<T>>(
  source: T, key: K,
): ToRef<T[K]> {
  const val = source[key]
  return isRef(val) ? val : (ObjectRefImpl(source, key) as any)
}

export function toRef<T>(
  getter: () => T,
): Readonly<Ref<T>> {
  return new GetterRef(getter) as any
}

// 关键差异：
class ObjectRefImpl {
  get value() { return this._object[this._key] }      // 读原对象
  set value(v) { this._object[this._key] = v }        // 写原对象
}

class GetterRef {
  get value() { return this._fn() }                    // 调 getter
  // 没有 setter：getter 形式默认只读
}
```

差异点：

- `ObjectRefImpl` 是**读写**双向桥：ref 的 `.value` 与原对象字段共享引用。
- `GetterRef` 是**只读**：底层没有 `_set`，强行赋值会得到运行时报错（在 dev 模式给出 warning）。

## 实战场景 {#production}

1. **解构不丢响应性**：const `{ count, name } = toRefs(state)` 适合一次拆多字段；只需要单字段时用 `toRef(state, 'count')` 更直观。
2. **watch 监听大对象里的某个字段**：`watch(toRef(() => state.user.profile.name), ...)` —— getter 形式天然支持「深层 + 嵌套路径」，不依赖 deep 选项。
3. **把 props 拆出某字段传给 composable**：`useCounter(toRef(props, 'count'))` —— 子组件拿到的就是响应式 ref，且会和父 props 双向同步。
4. **未声明的 reactive 字段**：`ObjectRefImpl` 会在 `source[key]` 不存在时返回 `undefined` 而不是抛错 —— 配合 TypeScript 用 `toRef(state, 'maybeKey' as const)` 更安全。

## 常见踩坑 {#pitfalls}

- **getter 形式不可写**：强行 `lengthRef.value = 0` 在 dev 模式会被 `ObjectRefImpl` 改成改原对象，**getter 形式不行**。
- **非 reactive 对象也能用**：`toRef` 第一参数并不要求是 reactive —— 普通对象也可以，但写入不会触发响应式更新。
- **`toRef` vs `computed`**：如果想要「根据其他 ref 计算」，用 `computed`；如果想要「对象的某个字段就是 ref」，用 `toRef`。
- **使用解构**：`const { count } = state` 会让 count 变成原始数字；想保留响应性必须 `toRef(state, 'count')` 或 `toRefs(state)`。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/reactivity-utilities.html#toref) | API 文档 |
| [RFC 232](https://github.com/vuejs/rfcs/discussions/346) | toRef / toValue / toRefs 设计讨论 |
| [Vue 源码 · ref.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts) | ObjectRefImpl / GetterRef |
| [Vue 源码洞察：toRef 与 ObjectRefImpl 的桥接语义](_analysis/vue-source-insights.md#toref-xxx) | 隐式经验 |