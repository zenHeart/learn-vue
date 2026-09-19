# 特殊属性：is / key / ref {#special-attributes-is-key}

> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/componentProps.ts`、`packages/runtime-core/src/renderer.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/built-in-special-attributes.html)

三个常被忽视的特殊属性：

- **`is="X"`**：把当前元素替换为 X 组件（HTML attribute 形式）或 `:is="X"` 把当前元素替换为动态组件。
- **`:key`**：vnode 标识 —— 强制重建（不同 key 不复用）、强制复用（相同 key 复用）。
- **`ref` / `:ref`**：模板引用，字符串值是 DOM 元素引用，函数值会获得卸载时回调。

## 这是什么 {#what}

```vue
<!-- is：动态组件 -->
<component :is="currentComp" />

<!-- 字符串值 is（HTML 原生 attribute 形式）：兼容模板解析问题 -->
<table>
  <tr is="vue:MyRow" />
</table>

<!-- key 在 v-for 中：强制不复用（不写 key 是默认复用） -->
<div v-for="item in list" :key="item.id">

<!-- key 在动态组件中：强制重建 -->
<component :is="comp" :key="version" />

<!-- ref 字符串 vs 函数 -->
<input ref="myInput" />
<input :ref="(el) => (myCallbackRef = el)" />
```

## 源码走读 {#source}

```ts
// packages/runtime-core/src/renderer.ts
// patch 阶段比较 key：相同 key 复用 DOM；不同 key 卸载旧 DOM 创建新 DOM

// packages/runtime-core/src/componentProps.ts
// is 与 key 是保留 key，不会作为普通 prop 传给组件

// packages/runtime-core/src/rendererTemplateRef.ts
// 字符串 ref：在 setup 返回 ctx.refs 上注册 DOM
// 函数 ref：每次更新调用 callback(element | null)
```

关键事实：

- **`is` 不创建新 DOM 元素**：是「在原节点位置渲染别的组件」，`<component :is>` 是其语法糖。
- **`is` 字符串值**：Vue 3 推荐用 `<component :is>`，但原生 `is="my-component"` 仍受支持（解决 HTML 解析限制，如 `<tr is="my-row">`）。
- **`:key` 强制重建**：不同 key 即便是同一组件，Vue 会销毁旧实例、创建新实例 —— `setup` 重新执行。
- **`:key` 复用**：相同 key 的 vnode 直接复用 DOM 实例，`setup` 不重跑、`onMounted` 不重触。
- **`:ref` 函数**：在每次组件更新 / 卸载时调用，`el === null` 表示卸载。

## 实战场景 {#production}

1. **Tab 切换强制重置**：`<component :is="Tab" :key="activeKey" />` —— 切到不同 Tab 时强制重新挂载（避免组件内部缓存）。
2. **v-for 必须加 key**：否则会因 DOM 复用导致 input 状态错乱、表单错位、动画失效。
3. **动态组件**：`:is` 配合 `<component>` 实现多形态渲染（如 Dialog/Menu/Notification 通用基类）。
4. **字符串 ref 整合第三方**：`<div ref="mapContainer">` 拿到 DOM 传给 mapbox.initialize(container)。

## 常见踩坑 {#pitfalls}

- **v-for 不写 key**：默认按 index 比较，性能差且 DOM 复用导致状态错乱；**必须**给 `:key`。
- **`:key` 用 index**：当列表增删时 key 不稳定，导致组件状态错乱；用业务 ID 替代。
- **`<component :is>` 与组件名**：必须是组件定义本身或组件名；传入字符串组件名需要在 components / app.component 注册。
- **`is="..."`（HTML 形式）**：仅用于解决 HTML 解析限制（如 `<tr>` 内不能放组件），普通场景用 `<component :is>`。
- **函数 ref 内存泄漏**：函数 ref 在卸载时也会被调用，如业务侧把 `el` 保存在组件外 map 中，需手动清理。
- **`:ref` 与 setup return**：setup return 的 ref 与模板 ref 同名时，模板 ref 优先级高；冲突时 setup return ref 仍可访问（同名覆盖）。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方 · 特殊属性](https://vuejs.org/api/built-in-special-attributes.html) | 完整 API |
| [Vue 官方 · is](https://vuejs.org/api/built-in-special-attributes.html#is) | is 文档 |
| [Vue 官方 · key](https://vuejs.org/api/built-in-special-attributes.html#key) | key 文档 |
| [Vue 官方 · ref](https://vuejs.org/api/built-in-special-attributes.html#ref) | 模板 ref 文档 |
| [`composition/15.useTemplateRef`](#) | 配套：useTemplateRef |
