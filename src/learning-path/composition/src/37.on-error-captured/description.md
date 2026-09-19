# onErrorCaptured 错误捕获链

> 版本：Vue 3.x | 状态：stable | 源码：`packages/runtime-core/src/errorHandling.ts` | 延伸阅读：[Vue 官方：错误处理](https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured)

## 这是什么

`onErrorCaptured(err, instance, info)` 是组件级的错误冒泡钩子：子组件（孙组件）渲染或事件回调抛错时，沿父链向上传递。任何一层返回 `false` 即停止向上传播。

应用级兜底通过 `app.config.errorHandler` 注册；与 `onErrorCaptured` 关系：

- 同步渲染错误、生命周期钩子抛错 → 都会经过 `onErrorCaptured` 链；
- `errorHandler` 在**链尾**调用，无法阻止冒泡，仅做监控 / 上报；
- 异步错误（`setTimeout` / `Promise`）**不会**进入捕获链。

## 源码走读

```ts
// packages/runtime-core/src/errorHandling.ts:39
export function handleError(err, instance, type) {
  callWithErrorHandling(app.config.errorHandler, ...)
  // 再向上冒泡到 onErrorCaptured
}
```

```ts
// packages/runtime-core/src/renderer.ts
// 渲染过程中 throw → 调用 callWithAsyncErrorHandling 捕获
```

## 实战场景

1. 全局 Sentry / 监控接入：使用 `app.config.errorHandler` 上报；
2. 关键模块自保护：用 `onErrorCaptured` 捕获子树错误，渲染降级 UI；
3. 库作者：在第三方插件内避免单点失败导致整页崩溃。

## 常见踩坑

- 不会捕获：事件回调内 `await` 后抛出的错误、setup 之外的 async 函数；
- 捕获钩子本身抛错会**循环调用**，必须用 try/catch 保护；
- 返回 `false` 仅阻止**继续向上冒泡**到 `errorHandler`，不影响已注册的链上其他 `onErrorCaptured`。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方：onErrorCaptured](https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured) | API 签名 |
| [Vue 官方：errorHandler](https://cn.vuejs.org/api/application.html#app-config-errorhandler) | 全局错误处理 |
| [Vue 源码：errorHandling.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/errorHandling.ts) | callWithErrorHandling |