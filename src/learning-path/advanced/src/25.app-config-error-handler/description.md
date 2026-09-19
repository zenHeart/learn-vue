# app.config.errorHandler + warnHandler 完整配置 {#app-config-error-handler}

> **版本**：Vue 3.0+ | **状态**：stable | **源码**：`packages/runtime-core/src/apiCreateApp.ts:130-145, 232-233` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/application.html#app-config-errorhandler)

`app.config` 提供应用级的异常兜底。`errorHandler` 覆盖**生命周期 / watcher / v-on / 自定义指令**等的同步抛错；`warnHandler` 仅在开发期被触发，对生产包无效。

## 这是什么 {#what}

```ts
app.config.errorHandler = (err, instance, info) => {
  // info 是 'render' | 'mounted hook' | 'watcher callback' | 'v-on handler' 等
  reportToSentry(err, { info, component: instance?.type.name })
}
app.config.warnHandler = (msg, instance, trace) => {
  // 生产构建会被 tree-shake 移除
  if (msg.includes('Avoid app logic that relies on enumerating keys')) return
  console.warn('[vue warn]', msg, trace)
}
```

## 源码走读 {#source}

```ts
// packages/runtime-core/src/apiCreateApp.ts:130-145
interface AppConfig {
  errorHandler?: (err: unknown, instance: ComponentPublicInstance | null, info: string) => void
  warnHandler?: (msg: string, instance: ComponentPublicInstance | null, trace: string) => void
  // ...
}

// packages/runtime-core/src/errorHandling.ts:30-50
function handleError(err, instance, info) {
  const appContext = instance?.appContext ?? emptyAppContext
  const errorHandler = appContext.config.errorHandler
  if (errorHandler) {
    callWithErrorHandling(errorHandler, null, ErrorCodes.APP_ERROR_HANDLER, [err, instance, info])
  }
  // 兜底 console.error
}
```

关键事实：

- `info` 字符串由 Vue 内部 `ErrorCodes` 枚举决定：`'render' | 'mounted hook' | 'watcher callback' | 'v-on handler'` 等。
- errorHandler 自身抛错时 Vue 会**自动**回退到 `console.error` —— 避免递归循环。
- `warnHandler` 在生产包中通过 `__DEV__` 守卫被 tree-shake 移除，写生产日志不要依赖它。

## 实战场景 {#production}

1. **Sentry / 自研埋点**：errorHandler 里直接 `Sentry.captureException(err)`，加上 `info` 作为 tag。
2. **路由级 500 页**：router.beforeEach 里检查全局 store 的错误标记；errorHandler 在 `'render'` 时跳转错误页。
3. **过滤已知 warning**：warnHandler 中匹配特定字符串后丢到 console 不显示，避免冗余 warning 淹没测试日志。
5. **多应用隔离**：每个 `createApp()` 都有独立 `config.errorHandler`；SPA 内嵌子应用、微前端各自拦截。

## 常见踩坑 {#pitfalls}

- **errorHandler 不能抛错**：内部抛错会被吞掉、然后转 `console.error`；写成同步函数 + try/catch。
- **`info === 'render'` 不是 'lifecycle'**：Vue 用更细的字符串区分生命周期阶段；监控面板应按 `info` 分桶。
- **warnHandler 在 dev 模式才触发**：做降噪时区分 dev/prod —— 生产警告已经被消除，写监控代码不要假设 warnHandler 一定跑。
- **`errorHandler` 拿不到错误源组件？**：拿到的是「**当前**挂载的」组件，而不是抛错的源头 —— 上报时仍要把 `instance?.type.name` 写入 tag。
- **`throwUnhandledErrorInProduction`（3.5+）**：默认 `false`；开启后未被 errorHandler 接住的同步错误会主动抛出到 `window.onerror`。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/application.html#app-config-errorhandler) | API 文档 |
| [Vue 官方](https://vuejs.org/api/application.html#app-config-warnhandler) | warnHandler 文档 |
| [Vue 源码 · apiCreateApp.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiCreateApp.ts) | config 类型与默认值 |
| [Vue 源码 · errorHandling.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/errorHandling.ts) | handleError 调用链 |