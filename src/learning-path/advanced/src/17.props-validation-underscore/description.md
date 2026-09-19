> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/componentProps.ts:623-630`、`packages/shared/src/general.ts` | **延伸阅读**：[Vue 官方 · Props](https://cn.vuejs.org/guide/components/props.html)

# props 校验顺序与保留名静默丢弃

## 这是什么

`validatePropName` 在 `componentProps.ts:623` 定义：

```ts
function validatePropName(key: string) {
  if (key[0] !== '$' && !isReservedProp(key)) {
    return true
  } else if (__DEV__) {
    warn(`Invalid prop name: "${key}" is a reserved property.`)
  }
  return false
}
```

含义：**以 `$` 开头的 prop**（例如 `$secret`、`$ref`）会被 `validatePropName` 直接拒绝并 dev 模式下警告。生产环境则**完全静默**——传入但不生效。

`_` / `__` 前缀的 prop（如 `_private`）同样会被静默丢弃，但走的是 `setFullProps`（line 392-394）里的 `isReservedProp(key)` 检查，而不是 `validatePropName`。注意：`__v_isRef` / `__v_isReactive` / `__v_raw` / `__v_skip` 这类内部字段在父组件传 prop 时也会被 `isReservedProp` 跳过（见 `setFullProps:392`），不会出现在子组件 props 上。

为什么这样设计？因为 Vue 把 `$el` / `$refs` / `$emit` / `$forceUpdate` 等保留给组件实例方法，把 `__v_isRef` / `__v_isReactive` / `__v_raw` / `__v_skip` 等保留给内部 reactive flags。允许外部同名 prop 会引发覆盖冲突。

## 源码走读

`packages/runtime-core/src/componentProps.ts:567-577`（normalizePropsOptions 中调用 validatePropName）：

```ts
if (validatePropName(normalizedKey)) {
  normalized[normalizedKey] = ...
  // 收集需要 cast 的 key
  needCastKeys.push(normalizedKey)
} else if (!isReservedProp(normalizedKey)) {
  // 同样保留 isReservedProp（与 SSR 内部标记相关）
  ...
}
```

注意：另一个分支 `isReservedProp` 检查的是 React 风格 `key` / `ref` / `__v_isRef` 等 SSR 内部标记。

校验顺序：

1. **类型校验**（`type` 不匹配 → 警告并尝试 coerce）
2. **必填校验**（`required: true` 但没传 → 警告）
3. **`validator` 函数**（返回 false → 警告）
4. **默认值填充**（未传值时填 `default`，且 `default` 工厂函数每次返回新对象）

`componentProps.ts:392`：

```ts
if (isReservedProp(key)) {
  // props 名为 ref/key 等保留字：跳过
  return
}
```

## 与内部隐藏标记的关系

Vue 在 reactive 对象上挂载 `__v_isRef` / `__v_isReactive` / `__v_skip` 等 `Symbol` 或 `__` 双下划线前缀字段——它们由 `proxyRefs` / `reactive` / `markRaw` 等 API 自动设置。`isReservedProp` 会跳过这些内部 key 防止它们被误当 prop 校验。

## 实战场景

1. **第三方组件 prop 命名**：避免使用 `$` / `_` 开头；与 Vue 内部 API 冲突。
2. **私有数据传递**：父级想给子级塞"私有字段"——Vue 不支持，props 必须有合法名字；私有数据请改用 provide/inject 或 Pinia store。
3. **判断未知 prop 是否生效**：dev 环境看控制台警告，prod 环境需要主动 lint 检测。

## 常见踩坑

- **生产环境静默丢弃**：dev 警告在 prod 不会有，必须在 lint 阶段（`vue-tsc` / ESLint `vue/no-reserved-component-names`）拦截。
- **`$listeners` / `$attrs`** 这类已被 3.x 移除的旧 API 不要在新代码中使用。
- **Props 校验顺序**：type → required → validator，遇到第一个失败就警告，但**不会中断后续校验**——多个 prop 同时类型错误会同时警告。
- **default 工厂函数**：对象 / 数组类型必须用工厂函数 `() => ({})` 返回，否则多实例共享同一引用导致状态污染。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · Props 校验](https://cn.vuejs.org/guide/components/props.html#prop-validation) | 类型、必填、validator 用法 |
| [Vue 源码 · componentProps.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentProps.ts) | 校验流程主入口 |
| [Vue 源码 · shared/general.ts](https://github.com/vuejs/core/blob/main/packages/shared/src/general.ts) | `isReservedProp` 列表 |
| [Vue 官方 · 透传 Attributes](https://cn.vuejs.org/guide/components/attrs.html) | `$attrs` 与 prop 边界 |

<!-- description.md -->
