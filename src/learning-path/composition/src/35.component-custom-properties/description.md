> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/componentPublicInstance.ts` | **延伸阅读**：[Vue 官方 · 增强类型](https://vuejs.org/guide/typescript/overview.html#augmenting-global-properties) | [Vue 官方 · ComponentCustomProperties](https://vuejs.org/api/utility-types.html#componentcustomproperties)

# ComponentCustomProperties：globalProperties 的类型增强

## 这是什么

`app.config.globalProperties` 允许注册"$"开头的全局属性（如 `$api`, `$t`）。但**默认情况下模板与 setup() 里访问这些属性，TypeScript 会报未知字段错误**。

解决方案：用 TypeScript 模块声明合并，把 `$xxx` 字段写进 `ComponentCustomProperties` 接口：

```ts
// types/globals.d.ts
import type { ComponentCustomProperties } from 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: {
      getUser: (id: number) => Promise<User>
      listPosts: () => Post[]
    }
    $filters: {
      formatDate: (d: Date) => string
    }
    $log: {
      info: (...args: unknown[]) => void
      error: (...args: unknown[]) => void
    }
  }
}
```

之后在任何 `.vue` 模板里 `{{ $api.listPosts() }}` 都有完整类型提示；在 setup 里通过 `this.$api` 也能访问（Options API）。Composition API 没有 this，需要 `getCurrentInstance()!.appContext.config.globalProperties.$api` 或直接 import composable。

### ComponentCustomOptions / ComponentCustomProps

| 接口 | 用途 |
| --- | --- |
| `ComponentCustomProperties` | 增强实例上的属性（globalProperties + this） |
| `ComponentCustomOptions` | 增强组件选项（如 vue-router 的 `beforeRouteEnter`） |
| `ComponentCustomProps` | 增强组件 props（如 vue-i18n 的 `t` 函数 prop） |

三者的覆盖范围不同，需要在不同场景下分别扩展。

## 源码走读

`packages/runtime-core/src/componentPublicInstance.ts`：

- `L144-184` `PublicInstanceProxyHandlers`：把 globalProperties 的 key 代理到实例上
- `L216-230` 类型推断：`ComponentCustomProperties` 是 `PublicInstanceProxyHandlers` 的类型源之一

模块声明合并是 TypeScript 的原生能力，不需要 Vue 写代码——但 Vue 把 `ComponentCustomProperties` 暴露为空 interface，给用户留扩展点。

## 实战场景

1. **第三方 SDK 注入**：自研 `$analytics` SDK 注入全局方法，模板里直接 `{{ $analytics.track('event') }}`。
2. **i18n / 翻译函数**：vue-i18n 通过 `ComponentCustomProperties` 让模板里的 `$t('key')` 获得类型提示。
3. **API 客户端挂载**：把 `$api` 注入到全局，组件 setup 里通过 `useGlobalApi()` composable 拿到，避免到处 import。
4. **调试日志**：`$log.error(...)` 在生产环境自动降级为 noop，开发环境显示完整调用栈。

## 常见踩坑

- **必须以 `declare module 'vue'` 包裹**：单独的 `interface Foo {}` 不会自动合并到 Vue 的全局类型；模块声明是合并的入口。
- **不要在运行时修改 ComponentCustomProperties**：这是纯 TS 类型，运行时增减字段 TypeScript 不会报；但模板编译时类型已固化。
- **Composition API 没有 this**：声明合并只影响 Options API 与模板语法，setup 里要用 `getCurrentInstance()`。
- **重名覆盖**：如果声明的 `$api` 类型与 setup 内 ref 重名，模板里解析会冲突——避免使用 `$` 开头的局部变量。
- **vue-tsc 与 vscode vue 插件识别**：声明合并文件必须被项目 tsconfig `include` 进来，否则类型增强不生效。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · 增强全局类型](https://vuejs.org/guide/typescript/overview.html#augmenting-global-properties) | 标准模式 |
| [Vue 官方 · ComponentCustomProperties](https://vuejs.org/api/utility-types.html#componentcustomproperties) | 类型定义 |
| [Vue 源码 · componentPublicInstance.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentPublicInstance.ts) | 代理实现 |
| [TypeScript · Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) | 模块合并机制 |
| [vue-i18n 源码](https://github.com/intlify/vue-i18n-next) | ComponentCustomProperties 实战范例 |