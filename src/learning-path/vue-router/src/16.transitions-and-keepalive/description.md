> 版本: Vue 3.5+ / Vue Router 4.x | RFC: — | 状态: stable | 源码: vue-router/packages/router/src/RouterView.ts:38-56 + vue/runtime-core 的 <Transition>/<KeepAlive>
> 延伸: [RouterView v-slot](https://router.vuejs.org/api/#router-view-slot) | [Vue Transition](https://vuejs.org/guide/built-ins/transition.html) | [Vue KeepAlive](https://vuejs.org/guide/built-ins/keep-alive.html)

# 16 · `<RouterView>` × `<Transition>` × `<KeepAlive>` 组合

`<router-view />` 默认写法只渲染匹配到的组件;带 `v-slot` 后,能拿到 `Component` 与 `route`,让外层用 `<Transition>` / `<KeepAlive>` 包裹。

## 这是什么

```vue
<router-view v-slot="{ Component, route }">
  <Transition name="fade" mode="out-in">
    <KeepAlive>
      <component :is="Component" :key="route.fullPath" />
    </KeepAlive>
  </Transition>
</router-view>
```

- `<Transition>` 给路由切换加淡入淡出;
- `<KeepAlive>` 把"已经访问过"的组件缓存,下次切换回来保留内部状态;
- `:key="route.fullPath"` 让不同 params/query 强制视为不同组件,避免同组件复用导致 transition 不触发。

源码里的官方注释:

```ts
// vue-router/packages/router/src/RouterView.ts:38
// We need to wait for the matched route to be determined before we can
// call router.resolve(). The router-view exposes a slot to let the
// consumer decide how to render the matched component.
```

## 源码走读

`RouterView.ts:74` 处把 `<router-view>` 的 slot 拆成 default + scoped;scoped slot 提供 `Component` 与 `route` 两个字段,这是所有过渡/缓存方案的接入点。`mode="out-in"` 让旧组件先 leave,新组件再 enter,避免两个组件同时出现在 DOM 里。

```ts
// vue-router/packages/router/src/RouterView.ts:55
// const slot = slots.default
// const slotProps = { Component, route }
```

## 实战场景

1. **真实场景** — 后台"用户列表 → 用户详情 → 返回列表"要求:列表的滚动位置、勾选项、筛选条件都要保留。`<KeepAlive>` + `:key="route.fullPath"` 是最常见组合。
2. **边界场景** — 想让"详情页"不缓存(每次重新请求),可在路由 `meta.keepAlive = false`,配合自定义 keep-alive 子组件按 meta 决定是否渲染 `<component>`。

## 常见踩坑

- **不写 `:key`**:相同组件复用,Transition 不触发,KeepAlive 不切换实例。永远带上 `route.fullPath` 或 `route.path`。
- **`<KeepAlive>` 缓存上限**:默认缓存所有访问过的实例。大型应用需用 `:max="10"` + `include/exclude`(路由名匹配)。
- **`<Transition>` 与异步组件**:async setup 组件在 Transition 里会出现 enter 时机不对;用 `appear` 让首次挂载也走 transition。
- **`mode="out-in"` vs `in-out`**:前者更安全(避免布局抖动);后者用于左右滑入等"两个组件并存"的动效,但容易触发 reflow。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [RouterView API](https://router.vuejs.org/api/#router-view-slot) | v-slot 用法 |
| [Vue Transition](https://vuejs.org/guide/built-ins/transition.html) | 6 个过渡类名 + JS 钩子 |
| [Vue KeepAlive](https://vuejs.org/guide/built-ins/keep-alive.html) | include/exclude/max |
| [vue-router 源码 RouterView.ts](https://github.com/vuejs/router/blob/main/packages/router/src/RouterView.ts) | slot 入口 |
