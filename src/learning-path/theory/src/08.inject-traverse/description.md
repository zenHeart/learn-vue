> 版本: Vue 3.x | 源码: packages/runtime-core/src/apiInject.ts | 难度: 中等

# 08 · provide / inject 链路解析

## 原理是什么

`provide(key, value)` 把数据塞进当前组件实例的 `provides` 对象；`inject(key)` 从当前组件实例出发，沿 `parent` 链向上查找最近一个 key 存在的祖先。Vue 内部用一个原型链技巧：`instance.provides = Object.create(parent.provides)`，这样 inject 的查找直接通过 `provides[key]` 沿原型链 O(1) 命中，性能与单层 props 类似。

当中间某一层用 `provide(key, value)` 重新声明同一个 key 时，本层 `provides` 对象直接覆盖原值，下游 inject 拿到的是"被覆盖"的值——这就是 shadowing（遮蔽）。

## 一步步走读源码

源码定位：

- `packages/runtime-core/src/apiInject.ts` 第 28-50 行：`provide`。
- 第 80-120 行：`inject`。
- 第 10-20 行：`resolveProvides` 处理原型链。

关键片段：

```ts
// apiInject.ts
export function provide(key, value) {
  if (!currentInstance) return
  let provides = currentInstance.provides
  const parentProvides = currentInstance.parent?.provides
  if (parentProvides === provides) {
    provides = currentInstance.provides = Object.create(parentProvides)
  }
  provides[key] = value
}

export function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance
  if (instance) {
    // 原型链查找：从 instance.provides 一直沿 __proto__ 找到 key
    const provides = instance.parent == null
      ? instance.vnode.appContext.provides
      : instance.parent.provides
    if (provides && (key as any) in provides) {
      return provides[key]
    }
    // 默认值 / 工厂...
  }
}
```

`resolveProvides` 把 `provides` 初始化为 `Object.create(parentProvides)`，这样首次 provide 时能识别"还没初始化过"，从而新建一个独立对象避免污染父级。

## 为何这样设计

- **原型链查找**：天然的"继承语义"，无需遍历 parent 链。
- **mutable**：provide 的值可以是响应式 ref 或 reactive 对象，下游 inject 拿到的是引用本身。
- **shadowing**：每层可以重新 provide 同名 key 覆盖上游，组件库封装时常用此模式屏蔽内部细节。

## 性能与权衡

- 查找 O(深度)，但深度通常 < 20，O(1) 原型链查找成本可忽略；
- 失去响应性的常见错误：`provide('count', count.value)` 在 setup 内只读了一次值；正确做法是 `provide('countRef', count)`（传入 ref）。

## Vue 官方延伸阅读

- 官方文档: <https://cn.vuejs.org/guide/components/provide-inject.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiInject.ts>

## 对应 RFC

RFC 23: Provide / Inject（替代 Event Bus 的官方推荐方案）

## 延伸：可手写极简版本验证

demo `08.inject-traverse/App/App.vue` 用 30 行手写原型链查找，并把链路可视化。

## 参考资料

- 《Vue.js 设计与实现》霍春阳，第 14 章「组件异步更新与 scheduler」
- 《Vue 技术揭秘》provide/inject 篇 <https://ustbhuangyi.github.io/vue-analysis/component/provide-inject.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiInject.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：effectScope 批量 dispose 副作用](_analysis/vue-source-insights.md#effectscope批量dispose副作用) | `packages/reactivity/src/effectScope.ts` 引用
