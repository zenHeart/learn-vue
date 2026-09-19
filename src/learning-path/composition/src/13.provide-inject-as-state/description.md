> 版本: Vue 3.x | 状态: stable

# Provide 状态层（store 风格）

把响应式 store 通过 `provide` 注入后代组件，可以视为一个轻量的全局状态机；`app.provide()` 还能把它注册到整个应用根，避免根组件重新提供一次。

## 这是什么

```ts
// key.ts
export const CounterKey: InjectionKey<Ref<number>> = Symbol()

// App.vue 顶层
import { ref, provide } from 'vue'
import { CounterKey } from './key'
const count = ref(0)
provide(CounterKey, count)

// 任意后代组件
const count = inject(CounterKey)!
count.value++  // 直接修改即可双向同步
```

或者在根应用注册：

```ts
app.provide(CounterKey, count)
```

效果与在根组件 `provide` 等价，对所有子树生效。

## Vue 怎么实现

- `app.provide()` 由 `packages/runtime-core/src/apiCreateApp.ts` 实现，调用链：`app._context.provides` → `provide` 写入当前根组件实例 provides
- 注入链路沿组件树的 `parent.provides` 链向上查找，遇到就停

## 实战中什么时候用 / 什么时候不用

**用**：

- 中小型项目不需要 Pinia
- 把同一份状态注入给一组相关组件（如多 Tab 共享的过滤器）

**不用**：

- 状态复杂、有 devtools 调试需求、跨域复用——使用 Pinia 更合适
- 大量数据需精细的依赖收集——用 store 库

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/components/provide-inject.html
- https://cn.vuejs.org/api/application.html

## 常见踩坑

- 直接 `provide(ref, count)` 在不同根实例之间不共享；如果希望全局唯一，需要在 `app.provide` 中提供
- 解构 `inject` 出的 ref 会丢失响应性，必须保留 ref 整体
- provide 一个对象 `{ count }`，后代修改时不会自动更新：必须 provide ref / reactive 对象本身

## 延伸阅读

- https://cn.vuejs.org/guide/components/provide-inject.html
- https://cn.vuejs.org/api/application.html#app-provide
- https://pinia.vuejs.org/introduction.html (作为对比)
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiCreateApp.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiInject.ts
- [Vue 源码洞察：effectScope 批量 dispose 副作用](_analysis/vue-source-insights.md#effectscope批量dispose副作用) | `packages/reactivity/src/effectScope.ts` 引用
