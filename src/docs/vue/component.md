---
title: component    
tags: vue componnet      
birth: 2017-10-11      
modified: 2017-10-11      
---

component
===
**前言:详解 vue component 的使用**

---

## 组件基础
1. 使用 `template` 申明组件结构
2. 使用 `Vue.component` 方法定义组件名及绑定组件构造函数
3. 直接在 Vue 的作用域使用组件标签实例化对象.

[创建组件](examples/component/restify.js)

可以在 Vue 或组件中使用 `compoonets` 属性定义组件的作用范围

> 申明的组件讲作用域绑定的空间.
> 注意申明的组件必须有有根节点,不支持并列模式
> 组件结构要符合标签插入原则否则参看   [is 特性](https://cn.vuejs.org/v2/guide/components.html#DOM-模板解析注意事项)


1. 在 Vue,或组件内部使用 components 定义组件对象
2. 在对应作用域使用组件

[componnets](examples/component/components.html)

## 组件通讯
## 组建数据
1. 组件 data 属性必须是函数.

> 重点是理解组件利用函数定义 data 确保,视图数据作用域隔离.
如果直接申明变量,多个组件公用一个模型.

详见 [data_componnet](data_component.html) 

## 父子组件
组件的数据为隔离作用域.
组件通过暴露 `props` 来给父组件进行赋值.
参看 [props component demo](children_component_props.html)
* 利用数组定义多个属性
    > 注意驼峰法属性在绑定值时采用中划线格式描述.
    该规则符合 html5 的属性命名实践.
* 默认属性传递为字符串.若传递属性为变量.
利用 `:<属性名>` 绑定属性,此时传入的字符串会被解析为变量.
例如范例中 `info` 属性的传递.
* 属性绑定为单向
> 父级数据变化会传递给子模块,但是子模块变量变化无法传递给父级

参看范例中单向绑定示例,父层数据变化会传递给子层.子层变化父级无法获知.

> **若传递的是引用,子层修改会影响父级**

* [ ] 此处数组操作有问题需研究?????????

* 可以给 `props` 传递对象.
并且限制接收的参数类型.参考范例中对数字和字符串的输入限制.
详见 [属性校验](https://vuejs.org/v2/guide/components.html#Prop-Validation)

> 该校验和 typescript 的思想相似.

## 组件事件
除了利用 `props` 向父元素暴露属性.
可以利用 `v-on` 的事件机制实现组件通讯.

组件中使用 `$emit('eventname')` 的方法发送事件
父级元素利用 `v-on:eventname` 捕获事件并执行相应回调.

范例参看 [component event](children_component_event.html)

* [ ] 怎样的组件才算父子组件???

---

## 组件实例属性：$data / $el / $options / $parent / $root

Options API 中可通过 `this` 访问的实例属性：

| 属性 | 类型 | 说明 |
|---|---|---|
| `$data` | object | 组件 data 对象的代理；`this.$data === this.data`（ref 指向同一对象） |
| `$el` | Element \| null | 组件挂载的根 DOM 节点；fragment 多个根节点时指向占位文本 |
| `$options` | object | 当前组件的 resolved options（合并了 mixin / extends 的最终结果） |
| `$parent` | instance \| null | 父组件实例；`$parent.$parent...` 一路可上溯 |
| `$root` | instance | 根组件实例；通常即 `app.mount()` 时传入的组件 |

> 推荐使用 `getCurrentInstance()` 或 `<script setup>` 中的局部变量；`$parent` 在多根节点 / Fragment 场景下不再可靠。

```ts
import { getCurrentInstance } from 'vue'
const inst = getCurrentInstance()
inst?.proxy.$el         // 同 this.$el
inst?.proxy.$options.name
```

更多：[Vue 官方：组件实例](https://cn.vuejs.org/api/component-instance.html)

---

## app.mixin：为何弃用

Vue 3 仍保留 `app.mixin` 用于向后兼容，但**官方已不推荐**——与 Options API 的隐式合并相同，它会让组件之间的属性来源变得不可追溯。`app.config.optionMergeStrategies` 也只是为它服务。

```ts
app.mixin({
  data() { return { ts: Date.now() } }
})
```

**为什么弃用**：

1. 与 Composition API 的显式 import 哲学相悖——状态来源不可见；
2. 多个 mixin 命名冲突时，merge 顺序决定优先级，难调试；
3. 类型推导困难；Vue 3.x 推荐用 composables 替代。

更多：[Vue 官方迁移指南：mixin](https://v3-migration.vuejs.org/breaking-changes/mixins.html)