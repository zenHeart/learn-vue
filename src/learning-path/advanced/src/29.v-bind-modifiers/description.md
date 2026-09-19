# v-bind 修饰符：prop / attr / camel {#v-bind-modifiers}

> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/compiler-core/src/transforms/vBind.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/guide/essentials/template-syntax.html#directives)

v-bind 修饰符控制「属性写到哪里、用什么形式」：

| 修饰符 | 作用 | 等价运行时调用 |
|---|---|---|
| `.prop` | 强制写入 DOM property（而非 attribute） | `el[key] = value` |
| `.attr` | 强制写入 DOM attribute（不走 property） | `el.setAttribute(name, value)` |
| `.camel` | 把 kebab-case 属性名转 camelCase | `el[camelName] = value` |

## 这是什么 {#what}

```vue
<!-- 默认行为：input.value 既写 property 也写 attribute -->
<input :value="text" />

<!-- .prop：强制走 DOM property -->
<div :foo.prop="obj">只设 property</div>

<!-- .attr：强制走 DOM attribute（用于 dataset / aria-*） -->
<div :data-id.attr="id" :aria-label.attr="label"></div>

<!-- .camel：把 view-box 转成 viewBox -->
<svg :view-box.camel="box"></svg>
```

## 源码走读 {#source}

```ts
// packages/runtime-dom/src/patchProp.ts
export function patchProp(el, key, value, ...) {
  if (key === 'class') { ... }
  // .attr 修饰符强制走 setAttribute
  if (isAttr) el.setAttribute(key, value)
  // 默认行为：先尝试 property，再 fallback 到 attribute
}
```

关键事实：

- **`.prop` 的核心价值**：DOM attribute 永远是字符串，复杂值（对象/数组/布尔）必须走 property；Vue 默认对常见属性（如 `value`、`checked`）做 property 写入，但对 `customProp` 之类自定义名默认走 attribute —— `.prop` 显式覆盖。
- **`.attr` 的核心价值**：HTML attribute 支持 `aria-*` / `data-*`，而 `setAttribute` 会保留原始大小写；Vue 的「自动 property 推断」对这些名字无效，`.attr` 强制走 attribute 路径。
- **`.camel` 的核心价值**：SVG 的 `viewBox`、`preserveAspectRatio` 等属性名是 camelCase，但 HTML 解析时会转为 kebab-case，写 attribute 路径时需手动 `camelize`。

## 实战场景 {#production}

1. **自定义元素 / Web Component**：传复杂 props（对象/数组）必须 `.prop`，否则被序列化成字符串丢失类型。
2. **dataset / aria 属性**：`<div :data-id.attr="id" :aria-label.attr="label">` —— 显式声明走 attribute，保证 kebab-case 不被错误转换。
3. **SVG 内联属性**：`<svg :view-box.camel="box">` 解决 SVG camelCase 属性无法直接用 HTML attribute 名的问题。
4. **第三方组件透传**：父组件用 `v-bind="$attrs"` 透传时，被 Vue 视为 attribute 路径；对 property-only 的 prop 须手动 `.prop` 覆盖。

## 常见踩坑 {#pitfalls}

- **Vue 默认会优化**：常见 DOM 属性（value / checked / class / style / dataset）自动走 property 路径，未必需要显式 `.prop`。
- **`.prop` 写 attribute 路径**：写 attribute 会把对象转字符串 `[object Object]`，**务必**对复杂值用 `.prop`。
- **`.camel` 仅影响键名**：不影响值；`:view-box.camel="box"` 中 `box` 仍然是对象字面量，按 property 路径写入 SVGElement。
- **布尔 attribute 的特殊性**：disabled / checked / selected 等无值 attribute（HTML 规范下空字符串代表 true）—— Vue 对 boolean 类型自动识别，但仍建议 `:disabled="false"` 显式控制。
- **SSR 路径**：SSR 时 `el` 是字符串而非 Element，`.prop` / `.attr` 在 SSR 路径下表现与 CSR 一致（都是序列化字符串），但 attribute 才是 SSR 的事实路径。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/guide/essentials/template-syntax.html#directives) | 模板语法章节 |
| [Vue 官方 · v-bind 用法](https://vuejs.org/api/built-in-directives.html#v-bind) | API 文档 |
| [Vue 源码 · patchProp.ts](https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/patchProp.ts) | 属性写入分发逻辑 |
| [MDN · Element.setAttribute](https://developer.mozilla.org/docs/Web/API/Element/setAttribute) | attribute 写入 |
| [MDN · SVG attribute reference](https://developer.mozilla.org/docs/Web/SVG/Attribute) | SVG 属性名规范 |
