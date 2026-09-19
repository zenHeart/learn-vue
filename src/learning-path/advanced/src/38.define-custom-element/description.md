> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-dom/src/apiCustomElement.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/custom-elements.html) | [Web Components 规范](https://developer.mozilla.org/docs/Web/Web_Components)

# defineCustomElement 创建原生 Web Component

## 这是什么

`defineCustomElement` 与 `defineComponent` 共享同一套类型推断与生命周期，它返回一个 **Web Component 构造函数**（继承自 `HTMLElement`），可以直接通过 `customElements.define()` 注册到浏览器自定义元素注册表中。注册后，`<my-element>` 标签像 `<div>` 一样可以在任何 HTML 里独立使用——React、Svelte、纯 HTML 页面都行。

与 `defineComponent` 的关键差异：

| 维度 | `defineComponent` | `defineCustomElement` |
| --- | --- | --- |
| 输出 | 组件选项对象 | Web Component 构造函数 |
| 挂载方式 | `app.mount('#app')` | `customElements.define('my-el', MyEl)` |
| 样式作用域 | `scoped` 编译 | Shadow DOM（默认） |
| props 传递 | 组件实例 | HTML 属性（kebab-case） |
| 事件触发 | `emit` | `CustomEvent`（`composed: true`） |
| 适用场景 | Vue 应用内部 | 跨框架、微前端、设计系统 |

### Shadow DOM 与样式隔离

Shadow DOM 是 Web Components 的核心能力。开启后（默认开启），组件的样式只作用于组件内部，不会污染外部页面。这让"组件库样式泄漏"成为历史——但代价是 Tailwind 等 utility 框架无法穿透，必须通过 CSS variables 传递主题。

```ts
const MyElement = defineCustomElement({
  props: { msg: String },
  styles: [`/* 默认注入到 shadow root */`],
  template: `<div>{{ msg }}</div>`,
})
customElements.define('my-element', MyElement)
```

## 源码走读

`packages/runtime-dom/src/apiCustomElement.ts` 是这个特性的全部实现：

- `L65-78` defineCustomElement 的两个 setup 重载 + 类型推断，与 defineComponent 保持一致
- `L812-834` `useHost()`：从当前实例拿到宿主的 `VueElement`，只能在 defineCustomElement 内部使用
- `L836-841` `useShadowRoot()`：返回当前 ShadowRoot；非 Shadow DOM 模式下返回 `null`
- `L155-184` `defineCustomElement` 默认开 shadow DOM（`shadowRoot: true`），可通过 options 关闭

运行时关键路径：`VueElement.connectedCallback → mount(this) → Vue 应用挂载到 ShadowRoot`，见 `L246-320`。

## 实战场景

1. **设计系统跨框架分发**：公司同时维护 React / Vue / 原生 HTML 项目，把按钮、对话框封装为自定义元素，一份代码三端复用。
2. **微前端 / iframe 嵌入**：第三方页面通过 `<user-card user-id="123">` 嵌入业务组件，避免样式与全局变量冲突。
3. **嵌入式 widget**：把产品功能封装成 `<script src="widget.js">` 注入的 `<your-product-widget>`，供客户集成到自己的网站。

## 常见踩坑

- **属性序列化**：props 通过 HTML 属性传递，所以 `Object`、`Array` 类型必须用 `:my-prop="..."` 形式传 JSON 字符串。`defineCustomElement` 内部做了自动反序列化（`camelize` + `JSON.parse`），但要避免传 `Date`、正则等无法 JSON 序列化的对象。
- **关闭 shadow DOM 才能用全局样式**：如果你的项目重度依赖 Tailwind / UnoCSS，要么 `:host` 选择器穿透，要么显式 `shadowRoot: false`。
- **CustomEvent vs emit**：组件内 `emit('change', payload)` 会被翻译为 `new CustomEvent('change', { detail: payload, composed: true })`；监听时要用 `addEventListener('change', e => e.detail)` 而非 Vue 的 `@change="..."`。
- **defineCustomElement 只在浏览器可用**：SSR 环境（`vue/server-renderer`）不会自动注册自定义元素，需要在 client bundle 里执行。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · Custom Elements](https://vuejs.org/guide/extras/web-components.html) | defineCustomElement 完整用法 |
| [MDN · CustomElementRegistry](https://developer.mozilla.org/docs/Web/API/CustomElementRegistry) | 浏览器侧注册 API |
| [MDN · Shadow DOM](https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM) | Shadow DOM 概念与 `::part` |
| [Vue 源码 · apiCustomElement.ts](https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/apiCustomElement.ts) | 实现入口 |
| [Vue 源码 · useHost](https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/apiCustomElement.ts#L812) | 拿宿主元素 |