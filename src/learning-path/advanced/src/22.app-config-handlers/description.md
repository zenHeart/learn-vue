# app.config.errorHandler / warnHandler：全局兜底 {#app-config-handlers}

> 版本: Vue 3.0+ | 状态: stable

`app.config` 提供应用级的钩子来集中处理渲染、生命周期、自定义指令中抛出的异常，以及开发期 warning：

- **`errorHandler(err, instance, info)`** — 组件渲染、生命周期、watcher 回调、v-on 监听器、`provide` 工厂抛错时被调用。**生产环境**默认会冒泡到 `console.error`；注册后可拦截做埋点 / 上报 / 弹 toast。
- **`warnHandler(msg, instance, trace)`** — 仅**开发环境**触发，对生产包无效。常用于过滤已知 warning、将其路由到自研日志系统。

## 触发时机对比 {#when-fired}

| 抛错位置 | errorHandler | warnHandler |
| --- | --- | --- |
| 组件渲染函数 | 是 | 否 |
| 生命周期 hook | 是 | 否 |
| 自定义指令 hook | 是 | 否 |
| `watch` / `watchEffect` 回调 | 是 | 否 |
| `v-on` 监听器 | 是 | 否 |
| `nextTick` 回调 | 是 | 否 |
| 开发期 warning（如 v-if 无 else 链） | 否 | **是** |

## 关键陷阱 {#pitfalls}

1. **errorHandler 自身抛错不会再次进入 errorHandler**（否则会无限递归），Vue 会回退到 `console.error`。
2. **`info` 是字符串**：`'render'` / `'mounted hook'` / `'watcher callback'` / `'v-on handler'`。
3. **`warnHandler` 在生产构建中被 tree-shake 移除**。
4. **多应用场景**：`createApp` 返回的实例各自持有独立 `config.errorHandler`，互不影响。
5. **`app.config.throwUnhandledErrorInProduction`（3.5+）**：默认 `false` —— 未被 errorHandler 接住的同步错误会抛到 `window.onerror`；设为 `true` 后会主动抛出，便于 host 框架拦截。

## 实战场景 {#production}

- **Sentry / 自研埋点**：errorHandler 里 `Sentry.captureException(err)`。
- **Vue Router 配合**：`info === 'render'` 时记录错误路径并跳转 500 页。
- **过滤冗余 warning**：`warnHandler` 中匹配字符串后丢到 console 不显示。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · app.config.errorHandler](https://vuejs.org/api/application.html#app-config-errorhandler)
- [Vue 官方文档 · app.config.warnHandler](https://vuejs.org/api/application.html#app-config-warnhandler)
- [Vue 官方文档 · app.config.throwUnhandledErrorInProduction](https://vuejs.org/api/application.html#app-config-throwunhandlederrorinproduction)
- [Vue 3 源码 · apiCreateApp.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiCreateApp.ts)

<!-- description.md -->
