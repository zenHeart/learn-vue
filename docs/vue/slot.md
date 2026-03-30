插槽
====

**详解 vue 中的插槽技术**

------

## 知识点
1. 采用 `slot` 标签申明默认插槽
2. 采用 `slot` 标签,利用 `name` 属性申明具名插槽
3. 采用 `slot` 标签,使用 `:valueName="value"` 暴露插槽内组件变量
4. 使用 `template` 标签引用默认插槽
5. 使用 `template` 标签,利用 `v-slot:name` 引用具名插槽
   1. `v-slot:default` 表示默认插槽
   2. 元素内容内容默认作为 default 插槽内容
6. 使用 `template` 标签,采用 `v-slot:slotName="valueName"` 引用插槽变量
   1. 支持解构语法
7. 使用 `template` 标签,采用 `#[slotName]` 快捷引用插槽
8. 使用 `template` 标签,采用 `v-slot:[valueName]` 实现动态引用插槽
   <!-- TODO: 9,10 需要补充示例 -->
9.  使用 `<template><slot/></template>` 的形式定义嵌套插槽
10. 组件使用 `$slots` 的方式引用插槽
11. 嵌套 slot 的默认值处理
12. 
认知模型:

1. slot 创建插槽,name 设置属性名 `:valueName` 绑定值
2. template 使用插槽, v-slot 绑定并使用属性值
3. `#`, slot 是语法糖

## v-if 与 slot 组合问题

### 问题现象

当父组件在使用了 `v-if` 的子组件上传入 slot 时，slot 内容可能无法按预期渲染或响应 `v-if` 的切换。

### 根本原因

slot 内容的编译和渲染发生在父组件作用域。当父组件使用 `v-if` 控制子组件是否挂载时：

- `v-if=false` 时，子组件不会被创建，整个 `<slot>` 标签不会渲染
- slot 内容在父组件模板中定义，但它的渲染位置在子组件的 `<slot>` 处
- `v-if` 控制的是子组件的挂载，而不是 slot 内容本身

### 示例

```html
<div id="app">
  <!-- 问题：v-if 切换时，slot 内容可能无法正常响应 -->
  <MyDialog v-if="show">
    <p>对话框内容</p>
  </MyDialog>
  <button @click="show = !show">切换</button>
</div>
```

```js
Vue.component('MyDialog', {
  template: '<div class="dialog"><slot></slot></div>'
})

new Vue({
  el: '#app',
  data: { show: false }
})
```

### 解决方案

#### 方案一：v-if 放在 slot 内容内部

将条件渲染移到 slot 内容内部，让条件判断发生在 slot 定义的上下文：

```html
<MyDialog>
  <p v-if="show">对话框内容</p>
</MyDialog>
```

**适用场景**：slot 内容需要响应父组件的数据变化，且不需要频繁切换整个子组件。

#### 方案二：使用 v-show 替代 v-if

`v-show` 通过 CSS `display` 控制显隐，不会销毁组件，因此 slot 内容始终存在于 DOM 中：

```html
<MyDialog v-show="show">
  <p>对话框内容</p>
</MyDialog>
```

**适用场景**：需要保持组件状态，或频繁切换显隐。但注意 v-show 在初始 `display:none` 时仍不会渲染内容。

#### 方案三：条件 slot（推荐）

使用 `<template>` 标签配合 `v-if`，在 slot 定义处控制条件：

```html
<MyDialog>
  <template v-if="show">
    <p>对话框内容</p>
  </template>
</MyDialog>
```

**适用场景**：最灵活的方案，可以精细控制 slot 内容的渲染时机，推荐使用。

### 认知总结

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| v-if 放内容内 | 条件在父作用域判断 | 简单直接 | 父组件始终传入 slot，组件内部仍有空 slot |
| v-show 替代 | CSS 控制显隐 | 保持组件状态 | 不支持 `<template>`，初始隐藏时内容不渲染 |
| 条件 slot | v-if 在 template 上 | 精确控制，可组合 | 需要多一层 template 包裹 |

**核心原则**：slot 内容的渲染上下文是父组件，`v-if` 应放在离它需要控制的 DOM 最近的位置。

## [作用域插槽](https://cn.vuejs.org/v2/guide/components-slots.html#%E4%BD%9C%E7%94%A8%E5%9F%9F%E6%8F%92%E6%A7%BD)
