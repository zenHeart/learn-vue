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

## Router
详解 Router 对象的配置项.
及实例化后的方法及属性

### 配置项

利用 `new VueRouter()` 创建路由对象时
可如下配置项.

* **routers**  核心配置项,定义各路由
的地址和对应跳转内容,该配置项为数组模式.每个路由包含如下配置属性
    * `path` 配置前端路由地址,详见 [路由配置](https://router.vuejs.org/zh-cn/essentials/dynamic-matching.html)
        > 核心字段
    * `component` 对应的组件名称
        > 核心字段
    * `name` 路由名称,
    * `components` 命名视图组件
    * `redirect` 重定向.利用该属性.实现路由的状态控制
    * `props` 属性值
    * `alias` 简写名称
    * `children` 定义嵌套结构路由时有用
    * `beforeEnter` 路由进入前的钩子脚本,包含如下参数
        * arg0 将要切换的路由对象
        * arg1 切换之前的的路由对象
        * arg2 一个回调句柄,切换后会执行该函数
    * `meta` 路由传递的值.
    * `caseSensitive` 布尔值.匹配路由大小写是否敏感
    * `pathToRegexpOptions` 正则匹配选项
* `mode` 路由路径模式.详见 [路由模式](https://router.vuejs.org/zh-cn/essentials/history-mode.html)
* `base` 路由对应的基路径
* `linkActiveClass` 需要结合 [router-link](https://router.vuejs.org/zh-cn/essentials/history-mode.html) 标签使用
    > 利用该配置激活对应的导航栏
* `linkExactActiveClass` 同上
* `scrollBehavior` 配置路由的滚动行为,详见 [滚动行为](https://router.vuejs.org/zh-cn/advanced/scroll-behavior.html)
* `parseQuerey/stringifyQuery` 覆盖查询路由的解析函数
* `fallback` 为了兼容性回退 hash 模式

### 实例化的 router
经过上述配置后.实例化的 `router` 包含如下方法和属性.

* 属性
    * `app` 绑定了该路由的 vue 对象
    * `mode` 路由对应的模式
    * `currentRoute` 当前的路由对象
* 方法
    * `beforeEach` 每个路由跳转前的钩子函数 ,详见 [导航守卫](https://router.vuejs.org/zh-cn/advanced/navigation-guards.html)
    * `beforeResolve` 路由完成钩子
    * `afterEach` 导航执行后钩子
    * `push` 保存路由
    * `replace` 替换路由
    * `go` 跳转到对应路由栈
    * `back` 返回上级路由
    * `forward` 顺着路由栈向前
    * `getMatchedComponents` 返回对应组件的构造函数
        > 在服务端渲染时利用此方法实例化组件
    * `resolve` 解析目标位置
    * `addRoutes` 动态添加路由
    * `onReady` 路由监听钩子
    * `onError` 路由错误钩子

### 路由信息对象
当注册路由钩子时会传入当前路由或跳转路由的信息对象.
包含的信息如下
* 属性
    * `path` 跳转路径
    * `params` 传入参数
    * `query` 查询对象
    * `hash` 路由的 hash
    * `fullPath` 完成的路由地址
    * `matched` 包含路由记录
    * `name` 路由名称(配置项定以后才有)
    
 
### 守卫导航
实例化的 `router` 对象可以注册钩子.
监听整个路由变化.

**全局钩子**

`boforeEach` 在跳转前执行

参见范例 [导航守卫](router_nav_guide.html)
注册函数回传入三个参数
    * `to` 切换到的路由
    * `from` 切换前的路由
    * `next` 回调 resolve 函数

> 必须调用 next 函数来说明该回调的执行结果.否则路由会被挂起.
导致视图不渲染!!!解析结果如下

* `next()` 切换到下一个注册函数,**注意同样必须调用 next 来申明执行结果**
* `next(false)` false 会终止该路由的切换,并切换到切换钱的目录.
    > 可以利用该方法进行路由的权限控制
* `next('/')` 切换到其他目录.
    > 注意切换到其他目录会导致重新触发绑定函数.若绑定函数没有终止.
    会导致循环触发路由.出现堆栈溢出
    > **一定要确保路由的循环是可终止的**
* `next(error)` 抛出一个错误对象,可以被 `onError` 捕获.  


`beforeResolve` 解析守卫,异步视图加载后执行

参见范例 [解析守卫](router_resolve_guide.html)

 `afterEach`,后置钩子
参见范例  [后置钩子](router_after_guide.html)


除了全局配置,实例化路由时每个路由支持如下
钩子属性.参见范例  [路由独享钩子](https://router.vuejs.org/zh-cn/advanced/navigation-guards.html)

* `beoforeEnter` 该路由进入前的钩子,可以用来做路由权限控制

此外还可在声明组件内部定义路由钩子.

* `beforeRouteEnter` 组件实例化前触发 
* `beforeRouteLeave` 路由离开前触发 
* `beforeRouteUpdate` 组件实例化后,数据刷新触发.例如 `/foo/:id` 类的路由 

这个导航守卫脚本顺序
1. 导航被触发
2. beforeRouteLeave 组件内部离开钩子
3. beforeEach 全局钩子
4. beforeRouteUpdate 组件重新更新钩子
5. beforeEnter 路由配置里调用视图钩子


总结,路由钩子分几类
* 全局钩子
    * `beforeEach`
    * `beforeResolve`
    * `afterEach`
* 路由钩子  
    * `beforeEnter`
* 组件钩子
    * `beforeRouteEnter`
    * `beforeRouteUpdate`
    * `beforeRouteLeave`

next 函数用来解析钩子回调的执行结果.

### 路由元信息
每个路由记录支持 `meta` 属性.
利用概述性实现对特殊路由的权限控制.
参见 [router_meta](router_meta.html).

> 应该结合全局状态控制路由切换

### 过渡动效
* [ ] 按下不看


### 数据获取
基于前后端分离的架构时.
切换路由渲染数据的方式
* 导航完成后,在组件声明周期钩子中获取数据
* 导航完成前,在路由进入的守卫中获取数据,
成功后导航

* [ ] [获取数据](https://router.vuejs.org/zh-cn/advanced/data-fetching.html)
