> **版本**：Vue 3.x | **状态**：anti-pattern | **源码**：`packages/runtime-core/src/renderer.ts:forceUpdate`

# `$forceUpdate` 反模式与 `triggerRef`

## 这是什么

`$forceUpdate` 是 Vue 2 时代遗留的「强制刷新」逃生口——Vue 3 响应式系统能自动追踪依赖，绝大多数场景用它都属于**反模式**：

- 它绕过响应式追踪，让依赖关系模糊；
- 它强制走 patch 流程，所有子组件都会重新评估；
- 它会让组件变得「不可预测」——读源码的人不知道为什么更新。

`triggerRef(shallowRef)` 是 Vue 3 推荐的「手动触发更新」方式——**只在确实需要时使用**（如异步拿到的非响应式数据），配合 `shallowRef` 避免深度代理开销。

```ts
import { shallowRef, triggerRef, markRaw } from 'vue'

// 错误：用 $forceUpdate 跳过响应式追踪
const data = ref({ items: [] })
// data.value.items.push(newItem)        // 响应式自动触发
// vm.forceUpdate()                       // 反模式：手动 forceUpdate

// 正确：用 shallowRef + triggerRef
const data = shallowRef({ items: [] })
data.value.items.push(newItem)
triggerRef(data)    // 显式触发
```

## 为什么 $forceUpdate 是反模式

1. **依赖关系丢失**：响应式的价值就是「让数据变更自动传播」。强制刷新一旦写多了，下次有人改数据时就不会想到响应式路径。
2. **patch 成本不可控**：forceUpdate 让当前组件走 patch，但子组件没有变化时也会重渲染（取决于 patch flag）。
3. **Composition API 时代更不该用**：`<script setup>` 中连 `this` 都没有，要拿 `$forceUpdate` 还得 `getCurrentInstance()`——毫无可读性。
4. **调试地狱**：在 Vue DevTools 里追踪不到数据源，只能看到「这个组件突然 patch 了一次」。

## 正确写法（按场景）

| 场景 | 正确写法 |
|---|---|
| 嵌套对象属性变更（ref 默认 deep） | 直接 `state.foo = bar` |
| 第三方大对象 / 类实例 | `shallowRef + triggerRef` 或 `markRaw` |
| 数组 push / splice | 直接操作，ref 默认响应式 |
| 子组件更新父组件没追踪的状态 | 把状态 lift 到响应式 ref |
| 跨组件「事件总线」 | `mitt` / 自建 eventBus / provide-inject |
| 「实在没辙」 | `$forceUpdate`（仅在逃生口使用） |

## 源码走读

```ts
// packages/runtime-core/src/renderer.ts
export function forceUpdate(instance) {
  if (instance.isMounted) {
    instance.update()       // 走 updateComponent → render → patch
  }
}

// packages/reactivity/src/ref.ts
export function triggerRef(ref: RefBase<any>) {
  if (__DEV__) {
    pauseTracking()         // 防止 ref.value = ... 时无限循环
  }
  trigger(toRaw(ref), TriggerOpType.SET, 'value', __DEV__ ? ref : undefined)
}

// shallowRef + triggerRef 是「明确绕过深度代理 + 精确触发」的官方姿势
```

## 实战场景（$forceUpdate 仅在以下情况使用）

1. **第三方库直接 mutate DOM**：ECharts / 地图库在 DOM 上改了尺寸，Vue 不知道；`$forceUpdate` 让布局计算再跑一次。
2. **应急修复（hotfix）**：线上发现状态没响应，立即用 `$forceUpdate` 兜底，事后改用响应式。
3. **测试 / 调试**：手动触发组件重新计算（如时间切片测试）。

**日常业务代码应当通过响应式自动触发更新；$forceUpdate 仅作逃生口。**

## 常见踩坑

- **`$forceUpdate` 不影响子组件的响应式**：子组件的 `computed` 不会重新计算；它只触发当前实例的 patch。
- **Composition API 中调用 $forceUpdate 必须 `getCurrentInstance()`**：可读性差，且 SSR 下可能拿到 null。
- **`triggerRef` 触发的是 SET 监听**：对 `computed` / `effect` 没有副作用；这是 shallowRef 的特性。
- **`markRaw` 后** shallowRef 也不会响应——但 `triggerRef` 仍能强制触发 patch。
- **永远不要把 `$forceUpdate` 写进 watch / onMounted**：那是数据源没响应式的征兆，应当修数据源。

## 替代品优先级

```
响应式自动触发  >  triggerRef  >  watch + callback  >  provide/inject  >  $forceUpdate
```

`$forceUpdate` 是这张表的最末位，仅在前面所有方法都不可行时使用。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://cn.vuejs.org/api/component-instance.html#forceupdate) | $forceUpdate 文档（明确标注「不推荐」） |
| [Vue 官方](https://cn.vuejs.org/api/reactivity-advanced.html#triggerref) | triggerRef |
| [Vue 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts) | forceUpdate 实现 |
| [Vue 源码](https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts) | triggerRef 实现 |
| [Vue 3 Migration](https://v3-migration.vuejs.org/breaking-changes/forceupdate.html) | Vue 2 → 3 关于 forceUpdate 的迁移说明 |