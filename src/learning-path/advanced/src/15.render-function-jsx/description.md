> 版本: Vue 3.x | 状态: stable

# 渲染函数与 JSX/TSX

`h()` 函数（hyperscript）是 Vue 3 渲染函数的底层 API，等价于模板编译器的输出。配合 `vite-plugin-vue-jsx` 可以直接写 TSX。

## 这是什么

```ts
import { h } from 'vue'

const App = {
  setup() {
    const count = ref(0)
    return () =>
      h('div', { class: 'app' }, [
        h('h1', null, `count: ${count.value}`),
        h('button', { onClick: () => count.value++ }, '+'),
      ])
  },
}
```

使用 TSX（需安装 `vite-plugin-vue-jsx`）：

```tsx
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)
    return () => (
      <div class="app">
        <h1>count: {count.value}</h1>
        <button onClick={() => count.value++}>+</button>
      </div>
    )
  },
})
```

## Vue 怎么实现

- `h()` 入口：`packages/runtime-core/src/h.ts` / `createVNode`，输出 VNode 对象
- TSX 由 `babel-plugin-jsx` / `@vitejs/plugin-vue-jsx` 把 JSX 翻译为 `h()` 调用
- 模板编译器 `compiler-dom` 同样生成 `createVNode` 风格的渲染函数

## 实战中什么时候用 / 什么时候不用

**用**：

- 动态 vnode 生成（递归组件、DSL 渲染）
- 强类型 props（TSX 类型推导）
- 跨端抽象层（自定义组件库）

**不用**：

- 业务页面——模板更易维护
- 需要 devtools 高亮支持——模板优先

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/extras/render-function.html
- https://cn.vuejs.org/api/render-function.html

## 常见踩坑

- TSX 中事件名需写成 `onClick` / `onMousedown`，与 HTML 原生大小写不同
- 模板的 `v-if` / `v-for` 在 TSX 中要用三元 / `map()`
- `class` / `style` 可以接受字符串、数组、对象
- TSX 子组件必须 PascalCase，否则会被当作原生标签

## 延伸阅读

- https://cn.vuejs.org/guide/extras/render-function.html
- https://cn.vuejs.org/api/render-function.html
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/h.ts
- https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx
- https://github.com/vuejs/jsx-vue2 (Vue 2 版本对比)
- [Vue 源码洞察：event 修饰符 once/passive/capture 与 vue:xxx 命名空间](_analysis/vue-source-insights.md#event-修饰符oncepassivecapture-与-vuexxx-命名空间) | `packages/runtime-dom/src/modules/events.ts:71-87` 引用
