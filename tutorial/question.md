---
title: question    
tags:       
birth: 2018-01-15      
modified: 2018-01-15      
---

question
===
**前言:**

---

## vuex 的意义
从效果上来说没有影响但是不建议这么做.谈一下我的理解.

vuex 从功能上来说就是一个前端缓存系统.
解决了 SPA 不同组件之间数据共享的问题

那么到底如何用,为什么会存在 mutation 等概念呢?

你可以看一下官方文档示例 [shopping-cart][1].

这个范例模拟电商中,添加商品到购物车,并进行结算的逻辑.
核心逻辑包括.

1. 拉取产品列表并显示
2. 点击添加到购物车
3. 进行结算.

站在用户的角度,用户只做了两件事
1. 将商品添加到购物车
2. 结算

在这里,添加商品会修改购物车的显示.
最简单的做法就把这些数据都放在父组件.

但是看一下官方示例如何实现的.
定义了两个组件
    * [ProductList.vue][2] 用来加载商品列表
    * [ShoppingCart.vue][3] 处理结算的问题

那么组件数据呢?全部放在了 vuex 中进行管理.
为什么要这么做,为什么不直接放在父组件里面呢?

1. 更清晰的代码结构,每个组件都有自己的职责,不必为了实现不同组件之间的交互而定义额外的数据总线或产生一个数据庞大的父组件来作为周转
2. 可复用的逻辑,将常用的业务利用 vuex 拆分成基于状态而非过程控制的代码.
3. ...

我们把上面的逻辑利用状态图表示





[1]: https://github.com/vuejs/vuex/tree/dev/examples/shopping-cart
[2]: https://github.com/vuejs/vuex/blob/dev/examples/shopping-cart/components/ProductList.vue
[3]: https://github.com/vuejs/vuex/blob/dev/examples/shopping-cart/components/ShoppingCart.vue
