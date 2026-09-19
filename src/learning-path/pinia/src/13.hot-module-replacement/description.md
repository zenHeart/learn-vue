> 版本: Pinia 2.x + Vite 5+ | RFC: — | 状态: stable | 源码: pinia/packages/pinia/src/hmr.ts:78-95 (acceptHMRUpdate)
> 延伸: [Pinia HMR 官方指南](https://pinia.vuejs.org/cookbook/hot-module-replacement.html) | [Vite HMR API](https://vite.dev/guide/api-hmr)

# 13 · `acceptHMRUpdate` 热替换

修改 store 文件时,Vite 默认会让整个模块重新求值,但 Pinia 的 store 工厂函数已经被 `defineStore` 闭包捕获,Vite 替换 export 后,**旧 store 实例仍引用旧闭包**,界面不会更新。

`acceptHMRUpdate(useStore, import.meta.hot)` 帮你做这件事:

1. 新模块加载时拿到 Pinia 实例;
2. 遍历旧 store 已注册的插件、`$subscribe` 订阅、`$state` 字段;
3. 把新模块的工厂函数注入到旧 store 上,后续 `useXxxStore()` 命中同一 store 时使用新逻辑。

## 这是什么

```ts
// pinia/packages/pinia/src/hmr.ts:78
export function acceptHMRUpdate<Id extends string = string, ...>(
  initialUseStore: StoreDefinition<Id, S, G, A>,
  hot: any,
) {
  if (!__DEV__) return () => {}
  return (newModule: any) => {
    const pinia = hot.data.pinia || initialUseStore._pinia
    if (!pinia) return
    hot.data.pinia = pinia
    for (const exportName in newModule) {
      // ... 把 useStore 重新挂载到 pinia._s
    }
  }
}
```

调用方式:

```ts
// stores/user.ts
export const useUserStore = defineStore('user', () => { ... })

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
```

## 源码走读

`hmr.ts:78` 的 `acceptHMRUpdate` 返回一个 `(newModule) => void` 函数,直接传给 `import.meta.hot.accept(fn)`。`hot.data.pinia` 是 Vite 的 HMR 数据通道,让两个模块之间共享一个 pinia 引用 —— 关键点是**新模块拿不到旧 pinia 引用,只能通过 hot.data 找回**。

## 实战场景

1. **真实场景** — 改 store 的某个 action 内部逻辑,保存后页面里已经点击"提交"的按钮立即走新逻辑,不用手动刷新或重置 state。
2. **边界场景** — 给 store 加新字段、删旧字段:HMR 不会自动迁移 state(`$state` 仍是旧 shape),需要在 plugin 里手动 merge;否则新字段全是 undefined,旧字段残留。

## 常见踩坑

- **生产构建会被剔除**:`acceptHMRUpdate` 内部判断 `__DEV__`,生产环境返回 noop,所以可放心写在 store 文件里。
- **每个 store 都得写一遍**:如果嫌烦,可以写个 Vite 插件,在 `import.meta.hot` 存在时自动插入 `import.meta.hot.accept(acceptHMRUpdate(useXxxStore, import.meta.hot))`。
- **Plugin 不会重跑**:HMR 只替换 store 工厂,插件是在 pinia 创建时挂的,旧 store 上已有的插件保持不变。
- **state 迁移**:HMR 不迁移 `$state`,新字段不会有初始值,旧字段保留;Setup Store 里 `ref` 闭包会被新工厂替换,但 Pinia 持有的 `state.value` 不会自动重置。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Pinia HMR Cookbook](https://pinia.vuejs.org/cookbook/hot-module-replacement.html) | 官方推荐用法 |
| [Pinia 源码 hmr.ts](https://github.com/vuejs/pinia/blob/main/packages/pinia/src/hmr.ts) | acceptHMRUpdate 实现 |
| [Vite HMR API](https://vite.dev/guide/api-hmr) | `hot.accept / dispose / data` 语义 |
| [vue-router HMR demo](../vue-router/17) | 配合 router 使用的注意点 |
