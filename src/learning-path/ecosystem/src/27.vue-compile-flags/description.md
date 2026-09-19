> **版本**：Vue 3.x | **状态**：编译时 flag | **源码**：`packages/global.d.ts`、`packages/runtime-core/src/index.ts`、`packages/runtime-dom/src/index.ts` | **延伸阅读**：[Vue 官方 · Compile-Time Flags](https://vuejs.org/api/compile-time-flags.html)

# Vue 3 编译时 flag 体系

## 这是什么

Vue 3 在编译产物里保留了一组以 `__VUE_` 开头的全局常量，作为「构建时由打包工具注入」的可配置开关：

| Flag | 默认值 | 用途 |
|---|---|---|
| `__VUE_OPTIONS_API__` | `true` | 是否启用 Options API（`data` / `methods` / `computed` 对象写法）。设为 `false` 后编译产物可彻底 tree-shake 掉 Options API 相关代码 |
| `__VUE_PROD_DEVTOOLS__` | `false` | 生产构建里是否携带 devtools 钩子。设为 `true` 可在生产环境调试组件树 |
| `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` | `false` | SSR hydration 不匹配时是否打印详细差异。开发期排查水合报错必备 |
| `__VUE_REACTIVITY__` | `true`（数组场景会强制开启） | 是否启用 `reactive()` 的数组 Proxy 代理路径（Vue 3.4+ 优化选项） |

这些 flag 由打包工具在编译期通过 `define` 替换为字面量。例如 `__VUE_OPTIONS_API__: false` 后，编译产物里的 `applyOptions` 调用会被 esbuild / rollup 视为死代码消除。

## 源码走读

```ts
// packages/global.d.ts
declare const __VUE_OPTIONS_API__: boolean
declare const __VUE_PROD_DEVTOOLS__: boolean
declare const __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: boolean
declare const __VUE_REACTIVITY__: boolean

// packages/runtime-core/src/apiCreateApp.ts
if (__VUE_OPTIONS_API__) {
  // applyOptions() 等 Options API 实现 —— flag 为 false 时整段被消除
}

// packages/runtime-core/src/hydration.ts
if (__VUE_PROD_HYDRATION_MISMATCH_DETAILS__) {
  warn(`Hydration node mismatch:\n  - client: ${clientVal}\n  - server: ${serverVal}`)
}
```

## 实战场景

1. **关闭 Options API 减小产物**：纯 Composition API 项目设 `__VUE_OPTIONS_API__: false`，通常节省 5–10 KB（min+gz）。
2. **SSR 项目打开 hydration 调试**：dev 期设 `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true`，拿到 server / client 两侧的具体值差异。
3. **生产环境需要调试**：临时设 `__VUE_PROD_DEVTOOLS__: true` 配合 vue-devtools 扩展查看组件树（注意：开启后包略大、且暴露内部状态）。
4. **关闭数组 Proxy 提升大列表性能**：超大规模列表（10k+ 响应式项）设 `__VUE_REACTIVITY__: false`（数组）后，Vue 走更轻量的对象代理路径，但失去数组方法（push/pop/splice）的响应式追踪——通常需配套 `shallowRef`。

## Vite 配置示例

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
})
```

## 常见踩坑

- **`__VUE_OPTIONS_API__: false` 后，组件还能写 Options API 吗？** 可以写，但运行时完全不生效（不会报错也没反应）—— 编译期消除 + 运行时静默跳过。属于隐性错误，必须配合 `eslint-plugin-vue` 的 `vue/no-options-api` 规则约束。
- **必须用字符串值传给 `define`**：`define` 是文本替换，`__VUE_OPTIONS_API__: true` 会被替换成裸 `true`，跟其他 token 黏在一起时会语法报错（`truemode`）。统一写字符串 `'true'` / `'false'`。
- **`__VUE_PROD_DEVTOOLS__` 不是性能开关**：它影响的是 Vue 与浏览器 devtools 扩展的握手。开发模式 devtools 始终开启。
- **`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` 仅在 production 构建生效**：dev 模式 Vue 总会打印 hydration 详情。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · Compile-Time Flags](https://vuejs.org/api/compile-time-flags.html) | 完整 flag 列表与默认值 |
| [Vue 源码 · global.d.ts](https://github.com/vuejs/core/blob/main/packages/global.d.ts) | flag 类型声明 |
| [Vue 源码 · apiCreateApp.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiCreateApp.ts) | `__VUE_OPTIONS_API__` 实际使用点 |
| [Vue 源码 · hydration.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/hydration.ts) | hydration mismatch 警告触发条件 |