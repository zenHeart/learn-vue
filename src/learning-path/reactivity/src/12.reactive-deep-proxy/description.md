# reactive 深度代理与 Proxy 拦截 {#reactive-deep-proxy}

> 版本: Vue 3.x | RFC: 0001-composition-api, 0003-data-option | 状态: stable

`reactive()` 内部使用 ES2015 `Proxy` 对目标对象进行**深度递归包装**：访问任意层级的属性都会触发 `get` 拦截，按需为子对象创建代理。这意味着：

- `reactive()` 只能代理**对象**（含数组、`Map`、`Set`）。传入原始类型会返回原值（Vue 源码 `createReactiveObject` 内显式判断 `targetType`）。
- 一旦某对象被代理，它的**所有子对象**在第一次被读取时也会被自动包装。
- 每个属性访问都会经过 `Reflect.get(target, key, receiver)`；Vue 在此判断 `isReadonly` / `isShallow` / `isRef` 并执行依赖收集（`track`）。

本 demo 演示三类行为：原始值不被代理、嵌套对象被按需代理、以及 Proxy 拦截器（get/set/has/deleteProperty/ownKeys）的实际触发。注：ES Proxy 规范定义 13 个 trap，但 Vue 在 `baseHandlers.ts` 只实现常用 5 个（get/set/has/deleteProperty/ownKeys）+ readonly 变体的 set/deleteProperty 警告。

## 关键陷阱 {#pitfalls}

1. **原始值无响应**：`reactive(0)` 返回 `0`，不要拿它当 ref 的替代。
2. **身份等价变化**：代理与原始对象是**不同引用**，`reactive(obj) === obj` 为 false；同一个原始对象多次传入 `reactive()` 会返回**同一个代理**（Vue 用 `WeakMap` 缓存），但跨 `reactive()` 调用同一子对象则不会共享代理。
3. **Vue 实际实现的 trap**：在 `baseHandlers.ts` 中，`MutableReactiveHandler` 实现了 `get`（line 55-134）/ `set`（142-192）/ `deleteProperty`（194-205）/ `has`（207-213）/ `ownKeys`（215-222）五个 trap；`ReadonlyReactiveHandler` 额外覆写 `set`（230-238）/ `deleteProperty`（240-248）做 warn-only。`set` 拦截中会做 `Reflect.set` 后触发 `trigger`；`deleteProperty` 拦截会判断 `key in target` 后再 `trigger`。
4. **Reflect.get 中的特殊分支**：当读取到的值是 `ref` 时，Vue 会**自动解包**（详见 14.ref-unboxing demo）；当处于 `shallow` 模式时直接返回原值不递归包装。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · Reactivity API](https://vuejs.org/api/reactivity-core.html#reactive)
- [Vue 官方文档 · Reactivity 深入](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [RFC 0001 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-composition-api.md)
- [Vue 3 源码 · baseHandlers](https://github.com/vuejs/core/blob/main/packages/reactivity/src/baseHandlers.ts)
- [Vue 源码洞察：reactive 对 Array / Map / Set / WeakMap 的代理限制](_analysis/vue-source-insights.md#reactive对arraymapsetweakmap的代理限制) | `packages/reactivity/src/reactive.ts:43-56,262-306` 引用
- [Vue 源码洞察：validateProp 类型校验与 validator 调用顺序](_analysis/vue-source-insights.md#validateprop类型校验与validator调用顺序) | `packages/runtime-core/src/componentProps.ts:682-719` 引用

<!-- description.md -->
