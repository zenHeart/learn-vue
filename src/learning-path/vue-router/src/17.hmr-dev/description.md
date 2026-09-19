> 版本: Vue 3.x HMR + Vite | RFC: — | 状态: stable | 源码: vite-plugin-vue(HMR) + vue-router/packages/router/src/RouterView.ts
> 延伸: [Vite HMR API](https://vite.dev/guide/api-hmr) | [Vue HMR](https://vuejs.org/guide/scaling-up/tooling.html#hot-module-replacement) | [RouterView](https://router.vuejs.org/api/#router-view)

# 17 · HMR 与 router-view

Vue 的 SFC 默认会被 Vite 接管 HMR,但**路由组件**有几个特殊点:

1. 同一组件在不同 path 之间复用时,组件实例不重建,Vite HMR 替换 patch 即可;
2. 跨组件切换时,组件被销毁再创建,新组件走完整 `setup` → 不是"热替换",而是"重建";
3. 路由记录(routes 配置)本身改完后,通常要刷新页面,因为 router 实例不会被 HMR。

## 这是什么

要让"修改路由组件源码"也能即时热更新,需要两件事:

- Vite 默认会接管 `.vue` 的 `import.meta.hot.accept()`,触发组件 patch;
- 路由实例本身放在 `App.vue` 而非 `main.ts` 的模块顶层,这样 `main.ts` 改动少,HMR 链路稳定。

```ts
// main.ts 不应该持有 routes 配置,否则 routes 一改整页要重载
import { createRouter } from './router' // 路由配置走单独文件,HMR 友好
import { router } from './router'
if (import.meta.hot) {
  import.meta.hot.accept('./router', (m) => m?.router && app.use(m.router))
}
```

## 源码走读

`RouterView.ts` 里组件实例挂载逻辑:

```ts
// vue-router/packages/router/src/RouterView.ts:38
// v-slot 的 Component 是 vnode,不是原始组件对象;
// 每次 matched 路由变化 → vnode.type 改变 → <component :is> 切到新组件
```

所以"修改了某个路由组件的 <template>"时,实际是 Vite 触发了 `Component.options.render = newRender`,被 KeepAlive 包裹时,patch 是原组件实例上的;无 KeepAlive 时,新实例走全新 setup。

## 实战场景

1. **真实场景** — 在 `<script setup>` 里修改 `ref` 初值、修改模板,保存后秒级看到效果;离开当前路由再回来,状态保留(默认行为,组件未被卸载)。
2. **边界场景** — 修改 `routes` 数组(新增/删除路径)不会自动生效,因为 router 实例本身没重建;可借助 `@vueuse/router` 或 `unplugin-vue-router` 的 HMR 适配,或者改成 `import.meta.hot.accept('./routes', ...)` 手动调 `router.removeRoute / addRoute`。

## 常见踩坑

- **修改 Pinia store 后无响应**:store 文件不在路由 HMR 路径上,需要 Pinia 自带 `acceptHMRUpdate(useStore)`(见 pinia 13.demo)。
- **修改 `router.push` 的目标路径**:这种修改是 in-place 的,Vite 的 ESM HMR 直接替换导出对象,无感生效;但 `import` 路径错了会让整页刷新。
- **KeepAlive 与 HMR 冲突**:被缓存的实例在 Vite 触发 patch 时,Vue 会用 `forceUpdate`,不会重跑 setup;若想"每次保存都重置",可在组件里 `onMounted` 检测 HMR boundary。
- **`<style>` 模块的 HMR**:Vite 会把 `<style>` 单独切 chunk,样式变更不需要重渲染组件,但若组件模板里依赖了 `:style` 绑定,样式变了视图不一定变。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vite HMR API](https://vite.dev/guide/api-hmr) | `import.meta.hot.accept/dispose` |
| [Vue HMR](https://vuejs.org/guide/scaling-up/tooling.html#hot-module-replacement) | 组件级热替换约束 |
| [Pinia HMR](https://pinia.vuejs.org/cookbook/hot-module-replacement.html) | `acceptHMRUpdate` 用法 |
| [vue-router 源码 RouterView.ts](https://github.com/vuejs/router/blob/main/packages/router/src/RouterView.ts) | v-slot 入口 |
