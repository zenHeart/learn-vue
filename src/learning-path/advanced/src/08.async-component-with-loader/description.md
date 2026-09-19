> 版本: Vue 3.x | 状态: stable

# defineAsyncComponent 完整配置

`defineAsyncComponent` 接受**选项对象**形式，可以指定加载中、加载失败、超时、错误回调等完整的异步加载生命周期。

## 这是什么

```ts
const AsyncComp = defineAsyncComponent({
  loader: () => import('./Chart.vue'),
  loadingComponent: Loading,
  errorComponent: Error,
  delay: 200,        // 200ms 内不显示 loading，避免闪烁
  timeout: 5000,     // 5s 内未返回则触发 error
  suspensible: true, // 与 <Suspense> 嵌套时使用父级 pending
  onError(err, retry, fail, attempts) {
    if (attempts <= 3) retry()
    else fail()
  },
})
```

## Vue 怎么实现

- 入口：`packages/runtime-core/src/apiAsyncComponent.ts`
- 内部创建一个 reactive 对象作为占位组件，通过状态机切换：未加载 → 加载中 → 加载成功 / 失败
- `onError` 回调在 loader reject 时触发，可以选择 `retry()` / `fail()`
- `suspensible: true` 时让 `<Suspense>` 控制 pending 状态

## 实战中什么时候用 / 什么时候不用

**用**：

- 路由级别代码分割
- 大型图表、地图、富文本编辑器

**不用**：

- 必须保证首屏可见的关键组件——延迟会触发空白闪烁
- 极小体积组件——拆 chunk 反而拖慢首屏

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/components/async.html
- https://cn.vuejs.org/api/component.html#defineasynccomponent

## 常见踩坑

- `loader` 必须返回 Promise；不会捕获同步抛错
- `delay` 是为了避免短延迟的闪烁；与 `timeout` 是不同的概念
- `onError` 中的 `attempts` 默认最大 3 次，超过后 fail

## 延伸阅读

- https://cn.vuejs.org/guide/components/async.html
- https://cn.vuejs.org/api/component.html#defineasynccomponent
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiAsyncComponent.ts
- https://cn.vuejs.org/guide/built-ins/suspense.html
- https://webpack.js.org/api/module-methods/#magic-comments
- [Vue 源码洞察：编译时 v-on 自动注册事件 vs 显式 emits](_analysis/vue-source-insights.md#编译时v-on自动注册事件vs显式emits) | `packages/runtime-core/src/componentEmits.ts:131-160` 引用
