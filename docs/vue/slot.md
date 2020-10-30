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

## [作用域插槽](https://cn.vuejs.org/v2/guide/components-slots.html#%E4%BD%9C%E7%94%A8%E5%9F%9F%E6%8F%92%E6%A7%BD)
