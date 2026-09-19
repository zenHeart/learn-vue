# app.component / app.directive / app.use 全局注册

> 版本：Vue 3.x | 状态：stable | 源码：`packages/runtime-core/src/apiCreateApp.ts` | 延伸阅读：[Vue 官方：应用实例 API](https://cn.vuejs.org/api/application.html)

## 这是什么

`createApp` 返回的 `App` 实例提供三种全局注册入口：

- `app.component(name, comp)`：把组件注册为全局组件，任何 SFC 内可直接以 `<name />` 使用，不需要 import。
- `app.directive(name, dir)`：把指令注册为全局指令，模板中可直接 `v-name` 使用。
- `app.use(plugin, options)`：装载 Vue 插件；插件要么是带 `install` 方法的对象，要么是函数（视作 install）。

`install` 函数接收 `(app, options)` 两个参数，因此插件内部可以递归调用 `app.component / app.directive / app.provide` 完成注册。

## 源码走读

```ts
// packages/runtime-core/src/apiCreateApp.ts:118
use<Options extends unknown[]>(
  plugin: Plugin<Options>,
  ...options: Options
): this {
  if (installedPlugins.has(plugin)) {
    warn(`Plugin has already been applied to target app.`)
  } else if (plugin && isFunction(plugin.install)) {
    installedPlugins.add(plugin)
    plugin.install(app, ...options)
  } else if (isFunction(plugin)) {
    installedPlugins.add(plugin)
    plugin(app, ...options)
  } else {
    warn('...')
  }
  return app
}
```

## 实战场景

1. 业务库（`@my-org/ui`）导出 `install(app)` 在 `app.use()` 时批量注册组件、指令。
2. 第三方 UI 库（Element Plus、Naive UI）的安装入口。
3. 内部工具包挂载 `v-tooltip` / `v-copy` 之类的全局指令。

## 常见踩坑

- `app.component` 注册名冲突时**不会警告**，后注册的覆盖前者；建议用命名空间前缀。
- `app.use` 内部对同一 plugin 会去重，重复调用只生效一次。
- 局部组件 / 指令仍然优先；全局注册主要用于跨模块共享、第三方库挂载。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方：app.component](https://cn.vuejs.org/api/application.html#app-component) | 注册全局组件 |
| [Vue 官方：app.use](https://cn.vuejs.org/api/application.html#app-use) | 装载插件 |
| [Vue 官方：插件开发](https://cn.vuejs.org/guide/reusability/plugins.html) | 插件编写规范 |
| [Vue 源码：apiCreateApp.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiCreateApp.ts) | use/component/directive 实现 |