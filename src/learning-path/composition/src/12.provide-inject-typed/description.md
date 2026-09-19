> 版本: Vue 3.x | 状态: stable

# Provide / Inject 强类型

`provide` / `inject` 是 Vue 3 的依赖注入 API，依赖 key 既可以是字符串也可以是 `Symbol`。`Symbol` key 配合 TypeScript 的 `InjectionKey<T>` 工具类型，能让 inject 调用获得完整的类型推断，避免误传 key 引发的运行时 `undefined`。

## 这是什么

```ts
import type { InjectionKey } from 'vue'
import { provide, inject } from 'vue'

interface UserInfo { name: string; level: number }
const UserKey: InjectionKey<UserInfo> = Symbol('user')

provide(UserKey, { name: 'alice', level: 9 })

// 注入端：拿到的直接是 UserInfo（可选 / 默认值场景见下）
const user = inject(UserKey)            // 类型：UserInfo | undefined
const safe = inject(UserKey, { name: 'guest', level: 0 }) // 类型：UserInfo
```

## Vue 怎么实现

- `InjectionKey<T>` 定义在 `packages/runtime-core/src/apiInject.ts`，它继承自 `Symbol`，因此在 dev 模式 Vue 可以利用 key description 给出警告信息
- `provide()` / `inject()`：基于当前组件实例的 `provides` 链向上回溯，与 props 类似，但是单向注入而不是显式传递

## 实战中什么时候用 / 什么时候不用

**用**：

- 跨层级组件共享数据：主题、用户、当前路由
- 注入 3rd-party 模块、通用工具方法

**不用**：

- 父子一层的简单场景，用 props 更直观
- 高频变化的数据：响应式失效时容易掉链子

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/components/provide-inject.html
- https://cn.vuejs.org/api/composition-api-dependency-injection.html

## 常见踩坑

- 默认值必须用工厂函数（`() => ({...})`）来避免共享引用
- Symbol 与字符串 key 不能混用——同名 Symbol 是不同对象
- 响应式问题：传入普通对象不会被追踪；应该传 `ref` / `reactive`
- 解构 `inject()` 不会丢失响应性（本身是只读上下文），但解构注入的 ref.value 同样需要保留 ref 才能保持响应性

## 延伸阅读

- https://cn.vuejs.org/guide/components/provide-inject.html
- https://cn.vuejs.org/api/composition-api-dependency-injection.html
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiInject.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/injectionSymbols.ts
- https://cn.vuejs.org/api/utility-types.html#injectionkey
- [Vue 源码洞察：effectScope 与组件 setup 的双向绑定](_analysis/vue-source-insights.md#effectscope与组件setup的双向绑定) | `packages/reactivity/src/effectScope.ts` 引用
