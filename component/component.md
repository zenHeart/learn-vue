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

## 创建组件
1. 利用 `component` 方法定义组件
    * `template` 属性申明模板
2. 创建 Vue 时绑定模板.

详见 [basic componnet](basic_component.html)

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