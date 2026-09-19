> 版本: Vue 3.0+ | RFC: — | 状态: stable | 概念: provide/inject + ConfigProvider

# 01 · `<ConfigProvider>` 全局配置的 provide/inject 模式

## 你会学到什么

主流组件库都允许「一次包裹，全局生效」：locale、size、namespace、zIndex 等。
Element Plus 的实现是 `provideGlobalConfig(config) → useGlobalConfig(key)`，
并把单个 config 拆成多个 InjectionKey（`localeContextKey`、`namespaceContextKey`、`SIZE_INJECTION_KEY`…），
组件按需 inject。

本 demo 复刻这个模式，演示：

- `createInjectionKey<T>(name)` —— 强类型 symbol key 工厂
- `provideGlobalConfig(config, app?)` —— 组件内 / 全局 app.use() 双入口
- `useGlobalConfig(key, default?)` —— 单字段读取，自动 computed 响应
- 嵌套 `<ConfigProvider>` 时自动合并（Element Plus 真实行为）

## 真实场景（抽象）

一个中后台页面：站点层用 `zh-CN` + `size=default` + `el-` namespace；
某个内部子系统的弹窗想用 `en-US` + `size=small` + `acme-` namespace。
两层 `<ConfigProvider>` 嵌套，第二层只覆盖它需要改的字段，其它继承。

## 动手试

1. 切「整体替换 / 嵌套合并」观察按钮和输入框的样式与文案
2. 切换中英文、看 locale 注入是否独立（不互相覆盖）
3. 切换 size，看 `size` 字段如何独立注入到 `useSize()` composable
4. 点「随机改 namespace」——观察 BEM 类名前缀 `el-` → `acme-` 的整体联动

## 关键模式

```ts
// 强类型 injection key
export const sizeContextKey: InjectionKey<Ref<string>> = Symbol('size')

// provide 端：组件内 + app.use() 双入口
export function provideGlobalConfig(config, app?) {
  const provideFn = app?.provide ?? provide
  provideFn(configProviderContextKey, computed(() => mergeConfig(oldConfig, cfg)))
  provideFn(sizeContextKey, computed(() => cfg.size))   // 单字段拆分注入
}

// use 端：自动 computed 响应
export function useGlobalConfig<K extends keyof C>(key: K, defaultValue?: D) {
  const config = inject(configProviderContextKey)
  return computed(() => config.value?.[key] ?? defaultValue)
}
```

`useSize()` 是这套模式的下游消费者：Button/Input/FormItem 通过它读 size，
而不是直接 inject 整个 config —— 让组件订阅最小化。

## 对比

| 库 | provide 拆分粒度 | 合并行为 |
|----|------------------|----------|
| Element Plus | 按字段拆 key（size/locale/namespace/zIndex/emptyValues） | `mergeConfig` 浅合并 |
| Naive UI | 整对象 + `mergedThemeRef` | 深合并，主题覆盖 |
| Ant Design Vue | `FormContext` + `FormItemContext` 嵌套 | context tree 自动传递 |
| PrimeVue | 整对象 `PrimeVueConfig` | shallow merge |

Element Plus 的「按字段拆 key」是性能最优解：组件订阅自己需要的字段，
config 整体变更时不会导致所有组件重算。

## 根因 / 设计取舍

- 拆 key：避免「改 locale 时所有 size 订阅都重算」
- 整对象 provide：避免 `provide` 几十次；保留「一次注入、多 key 引用」
- 嵌套合并：业务里 `<ConfigProvider>` 套娃常见，必须 merge

## 修复 / 变体

| 场景 | 解法 |
|------|------|
| 只想 inject 一字段 | `useGlobalConfig('locale', 'zh-CN')` |
| 嵌套时父不覆盖 | Element Plus `mergeConfig` —— 仅 `undefined` 才继承 |
| 全局改默认 | `useGlobalComponentSettings('button')` —— 它会调 `provideGlobalConfig` 把整对象重新 provide |

## 延伸阅读

- [Element Plus config-provider 实现](https://github.com/element-plus/element-plus/blob/dev/packages/components/config-provider/src/hooks/use-global-config.ts)
- [Vue 官方 provide/inject](https://cn.vuejs.org/guide/components/provide-inject.html)
- [Element Plus 设计：useGlobalComponentSettings](https://github.com/element-plus/element-plus/issues/2610)

## 下一步

02 · Headless 范式 —— 看完本节你已经会用全局配置；
02 教你把组件的「交互逻辑」抽成 composable，让样式完全交给用户。
