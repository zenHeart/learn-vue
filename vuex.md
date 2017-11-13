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

