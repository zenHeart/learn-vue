> 版本: Pinia 2.x | RFC: — | 状态: stable | 概念: Pinia 插件机制

# 08 · 自定义 Pinia 插件

Pinia 插件是一个函数：

```ts
function myPlugin({ store, options, pinia }) { ... }
```

可在其中：

- 给 store 增加新属性（`store.foo = ...`）；
- 监听 store 变化（`store.$subscribe`）；
- 监听 action 调用（`store.$onAction`）；
- 注册全局生命周期钩子。

通过 `pinia.use(myPlugin)` 启用；插件先于 store 实例化执行。

本 demo 写一个把指定 store 持久化到 localStorage 的插件，支持：

- 白名单（按 storeId 过滤）；
- JSON 序列化/反序列化；
- `$dispose` 时取消订阅。