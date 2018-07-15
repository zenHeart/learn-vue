---
title: vuex    
tags: vue tool      
birth: 2017-11-12      
modified: 2017-11-12      
---

vuex
===
**前言:讲解 vuex 状态管理工具的使用**

---

## 概述
vuex 来管理管理全局的通讯状态.
通过定义状态和路由来调用.

## 范例
使用 vuex 的过程
1. 注入依赖到 Vue
```js
import Vuex from 'vuex'
Vue.use(Vuex) 
```
2. 实例化状态
```js
const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment(state) {
            state.count++
        }
    }
}); 
```
重点是:
* `Strore` 申明存储状态
* `state` 申明状态值
* `mutations` 申明状态交互方法
3. 将实例化的 store 绑定到 Vue 实例中.
```js
new  Vue({
    store
}) 
```
4. 在组件或实例内部采用 `this.$store.state` 的方式是引用状态对象.
绑定计算属性来检测状态对象的变化.
5. 使用 `this.$store.commit` 的方式,发送状态对象的申明的函数名,来修改状态.

### mapState
为了方便对多个状态值的映射使用.
mapState 方法.

* 内部直接引用 state 的属性名即可
* 结合 js 对象扩展语法定义本地计算属性和 mapState 声明

### getters 和 mapGetters
对比组件当中 
* data 静态属性
* props 动态属性.

在状态管理中.
* state 静态状态
* getters 动态状态

同理 mapState 简化 state 的调用, mapGetters 简化动态状态调用.

### mutations
利用状态管理器中的 `mutations` 属性修改状态中的值.
> **不要直接修改 state 中的变量!!!!!**

利用 `this.$store.commit` 触发状态改变的回调

> mutations 中封装同步操作,避免在异步事件中修改状态
> 利用大写字符定义状态的切换方法

### actions
mutations 处理同步的状态变化.
actions 处理异步的状态变化

### modules
避免 vuex 由于过多的 state 造成的臃肿.
使用 modules 将状态拆封到多个模块中使用.
每个模块中又可以使用上述方法.各方法的内部参数指代当前模块.
采用 `rootState` 引用根模块.
详见 [module](https://vuex.vuejs.org/zh-cn/modules.html)

### 文件组织

```
├── index.html
├── main.js
├── api
│   └── ... # 抽取出API请求
├── components
│   ├── App.vue
│   └── ...
└── store
    ├── restify.js          # 封装导出 store 的地方,每一层单独引用
    ├── actions.js        # 根级别的异步事务
    ├── mutations.js      # 根级别的同步事务
    └── modules
        ├── cart.js       # 模块状态 1
        └── products.js   # 模块状态 2
```

[购物车范例](https://github.com/vuejs/vuex/tree/dev/examples/shopping-cart)


## 调试
* [严格模式](https://vuex.vuejs.org/zh-cn/strict.html)
    阻止采用非事件方式修改状态.
* [插件](https://vuex.vuejs.org/zh-cn/plugins.html)
    利用插件调试状态,记录状态树
* [测试方法](https://vuex.vuejs.org/zh-cn/testing.html)
* [热加载](https://vuex.vuejs.org/zh-cn/hot-reload.html)


## 重点回顾
* 不要直接修改状态属性,利用 `mutation` 进行通知
    * 也不允许采用 v-model 等间接方式修改状态值
    解决方法参见 [表单处理](https://vuex.vuejs.org/zh-cn/forms.html)
* `mutation` 处理同步事件,`actions` 处理异步事件
* 复杂的状态定义使用 `modules`
* [api 文档](https://vuex.vuejs.org/zh-cn/api.html)


