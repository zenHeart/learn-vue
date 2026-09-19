# 调试响应式：onTrack / onTrigger 与循环引用修复 {#ontrack-debug}

> 版本: Vue 3.x | RFC: 0001-composition-api | 状态: stable

`effect()` / `computed()` 接受第三个参数 `{ onTrack, onTrigger }` 调试钩子。**仅在 `__DEV__` 模式下生效**，因此生产构建不会有性能损失。

- `onTrack`：依赖**收集**阶段触发，可用于诊断"为什么我的 effect 跑了几百次"。
- `onTrigger`：依赖**变化通知**阶段触发，可用于追踪"是谁改了我的状态"。

每个钩子接收一个 `DebuggerEvent`，包含 `effect`、`target`、`type`、`key`、`newValue`、`oldValue`。

## 循环引用与栈溢出 {#circular-references}

最常见的栈溢出来源：

1. **`reactive` 对象互相引用**：Vue 会用 WeakMap 缓存，但首次访问仍会无限递归创建代理对象 → 栈溢出。**修复**：在构造时先 `markRaw` 内部引用，或将其中一个改为 `shallowRef`。
2. **effect 内修改自己读取的 ref**：无限循环 `trigger`。**修复**：在 effect 中加条件守卫或使用 `watch` 替代。
3. **computed 内修改其他 ref**：见 15.computed-dirty-and-cache。

## 关键陷阱 {#pitfalls}

1. **调试钩子只读**：钩子内部不能修改被追踪的对象，否则会无限触发 `onTrigger`。
2. **生产环境被剥离**：`onTrack`/`onTrigger` 仅 `__DEV__` 启用，不能用于业务逻辑。
3. **依赖收集深度**：`onTrack` 每次读取一个属性都会触发一次；嵌套对象的深层属性会递归触发。
4. **WeakMap 缓存**：Vue 内部对相同原始对象返回同一代理，所以日志里同一个对象只会出现一次 Proxy 包装。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · 响应式调试](https://vuejs.org/guide/extras/reactivity-in-depth.html#reactivity-debug)
- [Vue 官方文档 · effect](https://vuejs.org/api/reactivity-core.html#effect)
- [Vue 3 源码 · effect.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/effect.ts)
- [RFC 0001 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-composition-api.md)
- [Vue 源码洞察：arrayInstrumentations 处理副作用读取](_analysis/vue-source-insights.md#arrayinstrumentations处理arrayconcatincludesindexof等副作用读取) | `packages/reactivity/src/arrayInstrumentations.ts:42-60` 引用

<!-- description.md -->
