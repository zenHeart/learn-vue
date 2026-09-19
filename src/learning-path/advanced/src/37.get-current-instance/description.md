> **版本**：Vue 3.x | **状态**：advanced / 内部 API | **源码**：`packages/runtime-core/src/component.ts:775-805` | **延伸阅读**：[Vue RFC 0021](https://github.com/vuejs/rfcs/discussions/21)

# `getCurrentInstance()`

## 这是什么

`getCurrentInstance()` 返回当前 setup / 生命周期钩子正在执行的组件**内部实例**（`ComponentInternalInstance`）。它暴露的字段比公开实例（`this` / template ref）更丰富：

- `proxy`：对外公开的 proxy（等价于 `this`）
- `setupState`：setup 中返回的对象
- `ctx` / `data` / `props` / `isMounted` / `subTree` / `slots`
- `appContext`：全局 app context（`config`、`provides`、注册过的 component / directive）

Vue 3 内部大量代码（`useAttrs` / `useSlots` / `inject` / SSR context）都基于它实现。但**对外推荐仅用于 debug 或与第三方库集成**——业务代码应该用 `useAttrs`、`useSlots`、`inject`、`useTemplateRef` 这些语义化封装。

```ts
import { getCurrentInstance } from 'vue'

export function useInstanceDebug() {
  const inst = getCurrentInstance()         // 仅在 setup 同步执行期间可拿到
  if (!inst) throw new Error('Must be called inside setup()')
  return inst
}
```

`<script setup>` 中编译器会自动调用 `getCurrentInstance()` 处理模板引用、prop 校验、暴露声明等；业务代码通常拿不到这个调用上下文之外的实例。

## 源码走读

```ts
// packages/runtime-core/src/component.ts:775-805
export function getCurrentInstance(): ComponentInternalInstance | null {
  return currentInstance || currentRenderingInstance
}

let currentInstance: ComponentInternalInstance | null = null
export const setCurrentInstance = (instance: ComponentInternalInstance) => {
  const prev = currentInstance
  internalSetCurrentInstance(instance)
  instance.scope.onScopeDispose(() => {
    internalSetCurrentInstance(prev)
  })
}
```

`currentInstance` 在 `setupComponent` 中被设入；setup 同步跑完就清掉。所以**在 setTimeout / Promise.then 里调用 `getCurrentInstance()` 拿到的是 `null`**——这是「跨 await 边界」最常见的坑。Vue 提供 `app.runWithContext()` 解决一部分场景（见 composition 21 / 28 demo）。

## 实战场景

1. **DevTools / Vue 调试面板**：要展示组件 props、setup 返回值、自定义 meta 时需要直接访问内部实例。
2. **第三方库的 Vue 适配层**：例如表单库的 validate 逻辑想读 `instance.setupState` 拿到用户写的校验规则。
3. **组件库的全局事件总线**：通过 `inst.appContext` 拿到全局 `provides` / `config`，挂全局监听器。
4. **运行时注入到 mixin / directive**：拿到 `instance.vnode` / `instance.subTree` 做特殊处理。

## 常见踩坑

- **跨 await 失效**：`getCurrentInstance()` 只能在 setup **同步**上下文里调用；在 `setTimeout` / 微任务里调用返回 `null`。
- **业务代码不要用它**：仅作 debug / 适配用。语义化 API（`useAttrs` / `useSlots` / `inject`）优先级更高。
- **SSR 下的特殊性**：`onServerPrefetch` 等 SSR 钩子里能拿到 instance；但跨 request 不共享，每次都重新挂载。
- **`<script setup>` 中**：编译器帮我们做了大量转换；显式调用 `getCurrentInstance()` 通常没必要。
- **类型变化**：3.x 早期叫 `ComponentInstance` / `InternalInstance`，3.4+ 统一为 `ComponentInternalInstance`。

## 替代方案

| 场景 | 推荐替代 |
|---|---|
| 读 props | `defineProps` / `props` |
| 读 attrs | `useAttrs()` |
| 读 slots | `useSlots()` |
| 读 expose 的内容 | `useTemplateRef` + `defineExpose` |
| 读父组件 provide | `inject()` |
| 拿 app config | `app.config` 全局单例 |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://cn.vuejs.org/api/composition-api-helpers.html#getcurrentinstance) | API 文档与警告 |
| [Vue 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/component.ts) | `getCurrentInstance` 与 `setCurrentInstance` |
| [Vue RFC 0021](https://github.com/vuejs/rfcs/discussions/21) | Composition API 设计讨论 |
| [VueUse / pinia 源码](https://github.com/vueuse/vueuse) | 内部大量使用 `getCurrentInstance()` 拿到 appContext / scope |