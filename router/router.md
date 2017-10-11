---
title: router    
tags: vue router      
birth: 2017-10-10      
modified: 2017-10-10      
---

router
===
**前言:讲解 vue 路由的详细使用**

---

## 概述
通过一系列 demo 详细讲解 vue-router 的使用及注意事项.

## 范例学习
利用官方文档的一系列范例理解路由模块的使用.

### 静态路由
参看 [basic](basic_router.html) 文件.

1. 引入 `vue,vue-router` 模块
2. 利用 `router-link` 标签定义路由导航
    * `to` 属性确定切换的锚点
3. 利用 `router-view` 标签确定路由变换的节点
4. 初始化路由模块 `VueRouter`
    * `path` 属性制定路由
    * `component` 制定对应的模板
5. 注入路由模块并手动启动
    * `$mount('#app')` 将 vue 绑定在该节点并启动 vue.

### 动态路由
利用路由获取传入参数.
参看 [动态路由](dynamic_router.html)

1. 利用 `/foo/:id` 的形式定义路由.
该模式下所有 `/foo/*` 模式的路由都会指向相同模板.
利用 `$route.params` 对应路由参数对象
如范例:
* `/foo/1` 对应 `$route.params` 对象为 `{id:1}`   
* `/foo/2` 对应 `$route.params` 对象为 `{di:2}`

> **注意上面的方式只针对一层,如果是 `/foo/df/d` 多一层路径则无法提取**   

所以多添加一层对应的结果为

* `/foo/3/` 由于下一层为空,`$route.params` 为`{id:3}`
* `/foo/foo/bar` 多了一层导致无法获得下一层,`$route.params` 为空

> 此处可以看源码确定匹配模式??????????

更进一步利用 `:` 模式可以传递多个参数.例如 `/foo/:id/demo/:demo`

* `/foo/foo/demo/34` `$route.params` 为 `{id:"foo",demo:34}`


> 当采用动态路由指向相同视图时.组件不会发生销毁和重建.
此时无法利用路由变化,挂载组件的声明周期钩子.
此时利用 `$router` 对象变化来判断切换.

* `watch` 监察 `router` 变化
* `beforeRouteUpdate` 钩子绑定路由变化

详见 [响应参数变化](https://router.vuejs.org/en/essentials/dynamic-matching.html#reacting-to-params-changes)
除了上述匹配模式,也可利用正则进行路由参数提取.详见 [路由匹配](https://github.com/vuejs/vue-router/blob/dev/examples/route-matching/app.js)

### 嵌套路由

1. 利用 `children` 属性定义多级路由.
注意如下问题
* **一级模板中必须包含 `router-view`** 标签给下一级路由替换
* **二级路由若采用 `/`** 开头则合并到一级模板,多级同时替换

### 路由控制



