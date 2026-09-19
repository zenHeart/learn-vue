> 版本: Vue 3.0+ | RFC: 0001-composition-api | 状态: stable | 概念: toRaw / markRaw

# toRaw 与 markRaw

`toRaw(reactiveObj)` 返回被 Proxy 包装前的原始对象；`markRaw(obj)` 标记一个对象永远不会成为响应式。

## 你会学到什么

- `toRaw` 常用于需要把响应式对象传给第三方库或做浅比较的场景。
- `markRaw` 常用于冻结配置对象、第三方库实例，避免无意义的代理包装。
- 两者都不影响响应式追踪：toRaw 只是「绕过」代理，markRaw 是「禁止代理」。

## 动手试

1. 通过 toRaw 修改对象，验证响应式失效。
2. 引入 markRaw 包装一个不可变配置，确认 isProxy 为 false。

## 关键陷阱

- 不要在响应式 getter 中调用 markRaw，可能造成标记丢失。
- toRaw 仅对 reactive / shallowReactive 生效；ref 对象需要 `.value` 后再调用。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 - toRaw](https://vuejs.org/api/reactivity-advanced.html#toraw) | API 文档 |
| [Vue 官方 - markRaw](https://vuejs.org/api/reactivity-advanced.html#markraw) | API 文档 |