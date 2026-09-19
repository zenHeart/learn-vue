> 版本: Vue 3.0+ | RFC: — | 状态: stable | 概念: isRef / isReactive / isReadonly / isShallow

# isRef / isReactive / isReadonly / isShallow 一组类型守卫

四个布尔判断 API 帮助在运行时识别响应式对象的类型。

## 你会学到什么

- `isRef` 覆盖 ref / shallowRef。
- `isReactive` 覆盖 reactive / shallowReactive。
- `isReadonly` 覆盖 readonly / shallowReadonly。
- `isShallow` 区分 shallow 与深代理。

## 动手试

1. 替换各类型的 source，观察表格变化。
2. 在自定义工具函数里用它们做 narrowing。

## 关键陷阱

- isProxy 与 isReactive 重叠但不等价：readonly 也算 isProxy。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 - 类型守卫](https://vuejs.org/api/reactivity-utilities.html) | 完整 API |