# Vue 3 whitespace 处理策略

> 理解 Vue 3 编译器空白符处理机制，解决内联元素换行间距等常见问题。

## Table of Contents

[[toc]]

## 1. 背景

Vue 3 对模板编译器的空白符处理策略进行了重大调整：

| 版本 | whitespace 默认值 | 行为 |
|------|------------------|------|
| Vue 2 | `preserve` | 保留模板中的所有连续空白符 |
| Vue 3 | `condense` | 压缩连续空白符为单个空格 |

```js
// Vue 3 编译器选项
{
  compilerOptions: {
    whitespace: 'condense' // 默认值，可选 'preserve' | 'condense'
  }
}
```

**condense 模式的核心影响：**

- 连续空格/换行符被压缩为**单个空格**
- 内联元素（如 `<span>`、`<a>`）之间的换行会产生多余的空白节点
- `<pre>` 标签内的内容空白符行为也可能受影响

---

## 2. 三种模式详解

### 2.1 `'condense'`（Vue 3 默认）

压缩策略：
- 模板中连续的空白字符（空格、换行、制表符）合并为**一个空格**
- 标签之间的换行被完全删除
- 文本节点之间的多余空白被移除

```html
<!-- 源码 -->
<div>
  Hello
  World
</div>

<!-- 编译结果：显示为 "Hello World"（无换行） -->
```

### 2.2 `'preserve'`（Vue 2 行为）

保留策略：
- 保持模板中书写的原始空白符
- 换行符保留为换行
- 连续空格保留

```html
<!-- 源码 -->
<div>
  Hello
  World
</div>

<!-- 编译结果：保留换行和缩进 -->
```

### 2.3 HTML 默认行为

即使不做 Vue 编译，浏览器本身也会对 HTML 空白符做一定处理：

- HTML 规范中，连续空白符在渲染时被压缩为单个空格
- `<pre>` 标签会禁用浏览器默认的空白压缩

---

## 3. 受影响场景

### 3.1 内联元素换行产生多余间距

**最常见的问题**：

```html
<!-- 源码 -->
<div class="btn-group">
  <button>按钮一</button>
  <button>按钮二</button>
</div>
```

```css
/* 期望：按钮之间无缝隙 */
.btn-group button {
  display: inline-block;
}
```

**实际效果**：按钮之间会出现几像素的间隙。

**原因**：模板中 `<button>` 之间的换行符，在 `condense` 模式下被压缩，但浏览器渲染时，内联元素之间的空白文本节点仍会产生可视间距。

```html
<!-- 渲染后的 DOM 结构（condense 模式） -->
<div class="btn-group">
  <button>按钮一</button>␣<button>按钮二</button>
</div>
<!--                     ↑ 这里有个空格 -->
```

### 3.2 `<pre>` 标签内容空格丢失

```html
<pre>{{ code }}</pre>
```

如果 `code` 变量包含前导空格，Vue 3 的编译压缩可能导致空格被吞。

### 3.3 CSS `white-space: pre` 不生效

当编译器已将空白符压缩后，CSS 的 `white-space: pre` 无法恢复已经丢失的空白。

---

## 4. 排查方法

### 4.1 DevTools 查看多余文本节点

1. 打开浏览器 DevTools → Elements 面板
2. 展开目标元素，观察子节点之间的文本节点
3. 内联元素之间的空白节点就是问题的直接表现

```
div
  ├─ button "按钮一"
  ├─ #text "\n  "       ← 多余的空白文本节点
  └─ button "按钮二"
```

### 4.2 编译产物搜索

查看 Vite/Webpack 的编译产物：

```js
// Vite 配置中开启 compilerOptions
export default defineConfig({
  vue: {
    compilerOptions: {
      // 临时改为 preserve 观察变化
      whitespace: 'preserve'
    }
  }
})
```

然后对比编译前后的差异，或在浏览器控制台直接打印编译结果：

```js
import { compile } from 'vue/compiler-sfc'

const result = compile(`<div>
  <span>Hello</span>
  <span>World</span>
</div>`, {
  whitespace: 'condense' // 或 'preserve'
})

console.log(result.code)
```

### 4.3 区分：编译器压缩 vs 浏览器渲染

| 现象 | 原因 | 解决 |
|------|------|------|
| 按钮间有缝隙 | 浏览器内联元素默认行为 + 编译器换行压缩 | CSS `float` / `flex` / `grid` |
| pre 内空格丢失 | 编译器压缩了空白 | `whitespace: 'preserve'` |
| CSS `white-space: pre` 不生效 | 编译器已经删除了空白 | `whitespace: 'preserve'` |

---

## 5. 解决方案

### 5.1 方案一：配置编译器 `whitespace: 'preserve'`

恢复 Vue 2 的行为，保留模板中的原始空白符。

**Vite 配置：**

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue({
    compilerOptions: {
      whitespace: 'preserve'
    }
  })]
})
```

**Vue CLI 配置：**

```js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module.rule('vue').use('vue-loader').tap(options => {
      options.compilerOptions = {
        ...options.compilerOptions,
        whitespace: 'preserve'
      }
      return options
    })
  }
}
```

**影响评估：**

- ✅ 完全恢复 Vue 2 空白处理行为
- ✅ 解决内联元素间距问题
- ⚠️ 编译产物会包含更多空白字符（文件略大）
- ⚠️ 不兼容 Vue 2 项目升级（行为差异）

### 5.2 方案二：CSS 解决方案（推荐）

不改变编译器配置，通过 CSS 消除间距。

**Flexbox 方案（推荐）：**

```css
.btn-group {
  display: flex;
}
/* 或 */
.btn-group {
  display: inline-flex;
}
```

**Grid 方案：**

```css
.btn-group {
  display: grid;
  grid-auto-flow: column;
}
```

**Font-size 归零方案：**

```css
.btn-group {
  font-size: 0;
}
.btn-group button {
  font-size: 14px;
}
```

### 5.3 方案三：HTML 模板压缩

在模板中避免内联元素之间的换行和空格：

```html
<!-- ❌ 有换行，会产生空格 -->
<div>
  <span>Hello</span>
  <span>World</span>
</div>

<!-- ✅ 紧密排列 -->
<div><span>Hello</span><span>World</span></div>

<!-- ✅ 或使用 Mustache 表达式拼接 -->
<div>{{ first }}{{ second }}</div>
```

### 5.4 方案四：HTML 实体 `&nbsp;`

对于必须保留间距的场景，使用不换行空格：

```html
<span>Hello&nbsp;World</span>
```

但这仅适用于纯文本内容，不适合作为通用间距解决方案。

### 5.5 方案五：`v-text` vs 插值

对于纯文本内容，使用 `v-text` 代替插值可避免空白问题：

```html
<!-- 插值可能有空白问题 -->
<span>{{ text }}</span>

<!-- v-text 直接设置文本节点 -->
<span v-text="text"></span>
```

---

## 6. 最佳实践

### 6.1 项目迁移 Checklist

从 Vue 2 迁移到 Vue 3 时，检查以下内容：

- [ ] 内联元素（button/a/span）之间是否有换行 → 改为紧密排列或使用 flex
- [ ] 是否依赖 `<pre>` 标签保留空白 → 考虑 `whitespace: 'preserve'`
- [ ] CSS 是否使用 `white-space: pre` → 验证空白是否被正确保留
- [ ] 是否有手动拼接空白字符串的代码 → 检查是否仍需要

### 6.2 推荐决策树

```
内联元素之间有间距问题？
├── 是
│   ├── 优先使用 flex/grid 布局 → 推荐
│   └── 必须横向排列？→ float 或 font-size: 0
└── 否
    ├── <pre> 内空白丢失？
    │   ├── 是 → whitespace: 'preserve' 配置
    │   └── 否 → 无需处理
    └── 需要保留原始空白格式？
        ├── 是 → whitespace: 'preserve' + CSS white-space
        └── 否 → 默认 condense 即可
```

---

## 7. 参考链接

- [Vue 3 Compiler Options - whitespace](https://vuejs.org/api/compile-time-options.html#whitespace)
- [Vue 3 SFC Compiler](https://github.com/vuejs/core/tree/main/packages/compiler-sfc)
- [CSS white-space 属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/white-space)
- [HTML 空白符处理规范](https://html.spec.whatwg.org/multipage/dom.html#text-content)

---

tags: [vue3, compiler, whitespace, 空白符, 间距]
