# 基本概念

## 指令

指令的概念和 angular 类似.
vue.js 以 v 作为前缀.

* 修饰符的概念,用来限定指令的执行逻辑
* `:<属性名>` 等同于 `v-bind:<属性名>` 
* `@<方法名>` 等同于 `v-on:<方法名>` 

## 过滤器
和 angular `filter` 相似.
核心原理就是管道思想.

## 计算属性

* computed 属性可以定义一个方法.
视图层会把它当做函数解析.

若计算属性的结果不依赖于观察值.
他只会渲染一次.例如 

```js
computed: {
  now: function () {
    return Date.now()
  }
} 
```

默认计算属性只是单纯的 `getter` 属性.

若期望在计算属性上赋值实现类似普通属性的变化.
可以设置 set 方法.

**注意计算属性只针对监听变量设置 set 才有意义**


## 变量观察
类似 angular scope 暴露的 `$watch` 方法.

相比采用此方法检测变量变化.
可以使用 `computed` 更加直观易用.

通过计算属性可以实现对绑定值做再加工.

## class

类似 angular `ng-class` 支持如下模式

* `{classname:flag}` 当 flag 为真时,显示类名.
    类名不会出现 angular 被转换成中划线的坑.

* `{classname:flag,classname1:flag1}` 解析多个类名

* 也支持对象方式引用,对象中每个键名是一个类

* 也可使用计算属性来绑定,**这个在复杂的逻辑判断中十分有用**

* `[var1,var2]` 也可使用数组,每个变量代表一个值.

* `[isActive?activeClass:inactiveClass]` 利用三元表达式触发不同类

* `[{active:flag},errorClass]` 可以支持数组和单值判断的混写

## style

类似 class 可以动态绑定样式.
**不建议使用**
 
# 模板逻辑
## v-if
* v-if 和 v-else 控制绑定元素是否显示
若要控制一个模板组的显示.可利用 `template`.
此时 `template` 不会显示.
这个在没有嵌套结构的模板中很有用.

注意 vue 对于相同的模板,在视图切换时不会重新变化.
此时可以在模板上定义 `key` 属性实现强制渲染.

注意模板逻辑和 `v-show` 不同.
当使用模板逻辑时改变的是 dom 节点.
而 ng-show 只是单纯的控制 display 属性的显示.

```html
<template v-if="ok">
<h1>Title</h1>
<p>Paragraph 1</p>
<p>Paragraph 2</p>
</template>
```

## v-for
* `v-for='(item,idex) in items'` 支持数组遍历,同时包含索引
    * in 也可替换为 of
* `v-for='(value,key,index) in obj'` 支持对象遍历
* `v-for='i in 10'` 整数迭代,实现固定次数迭代,i 为从 1-10 的数字

**在迭代模式创建视图,利用 `key` 属性添加索引 id**


## 逻辑优先级 
这个概念和 angular 配置指令优先级原理类似.

* 同级 v-for 大于 v-if
* 父级节点逻辑大于子节点

## 变异方法
对于绑定了脏值检测的数组变量.
当利用利用索引调用数组方法时,会触发视图刷新.

数组方法包括:

* push 
* pop
* shift
* unshift
* splice
* sort
* reverse

还支持如下方法改变视图

* filter
* concat
* slice

**注意对于视图数据一下操作者可能导致视图无法检测渲染**

* 利用索引直接设置
* 强制改变数组长度

请使用 Vue 封装的视图方法改变数据.

可以利用 methods 和计算属性灵活过滤数组元素.

## 事件绑定

* 支持表达式解析
* 支持函数绑定
    * 默认参数为事件对象 
    * 也可传递自定义参数
    * 利用 `$event` 附加自定义参数
* 支持事件修饰符,用来描述事件的执行特性
    * stop 组织事件执行
* 按键修饰符

组件绑定事件后,利用 `$emit` 实现事件传递.




## 表单
v-model 相比 v-bind,省略了


## 组件
凡是使用 vue 绑定的 dom 对象都可称之为组件.
组件有如下几种


利用 `Vue.component` 可以将组件注册到全局.

组件的作用与不一定要在全局.
可以在绑定元素上定义 `component` ,此时组件作用域为该元素内.

**组件必须在绑定根实例后才可使用**

**组件回因为 html 元素嵌套限制导致失效**
解决方法有
* 使用 `is` 属性绑定元素
* 使用模板字符串绑定属性

**组件 data 必须是函数** 为什么?

模板的独立作用域和共享作用域问题.

**利用 props 实现组件属性定义**
注意小写驼峰法会变成中横线属性名.

若是字符串模板没有此限制

**属性若不采用 v-bind 只是单纯的字面形式绑定**

这个和 angular 不同,angular 会根据绑定策略选择解析方式.

默认组件的绑定是单向数据流.

对于父元素的传入处理,可利用 
* data 初始化
* 计算属性来重构

对于对象和数组,由于是引用类型.
子组件会修改父组件状态.

**可以利用类型限制组价属性的输入**

组件和组件的通讯.
利用空的 `vue` 对象作为传输通道.

为了实现组件的嵌套在定义组建时
在外层加上 `slot` 的标签进行申明.

可以用具名的 `slot` 实现组合插槽

作用于插槽比较难以理解.

类似于 `angular` `transclusion` 属性.

**不要在组件上绑定父元素方法**
这是一种耦合行为.应该在组件上定义实现.

组件的核心特性
* props 实现和父级沟通
* events 组件之间的沟通体系
* slots 组件的嵌套逻辑

利用 `$refs` 访问组件

## 过渡效果

利用 transition 标签封装过渡效果.

1. 根据标签名查找对应的 `<name>-enter,<name>-leave`
等属性.根据添加属性触发动画效果

2. 如果提供了对应的钩子函数,会利用 js 进行绘制

3. 若以上均为找到会直接在下一动画帧执行节点操作.

使用过渡标签会自动把 `name` 对应的名称作为
前缀连接到一下预定义类名中.其中以中划线隔开.

* `<name>-enter` 元素插入时生效
* `<name>-enter-active` 元素插入时生效
* `<name>-enter-to` 在元素插入后,动画执行一帧后生效.
* `<name>-leave` 在离开过渡被触发时生效
* `<name>-leave-active` 过渡触发后立即生效
* `<name>-leave-to`

详解如下图

![](https://cn.vuejs.org/images/transition.png)

**若没有定义过渡名,则以 v 作为前缀**

也可以通过 transition 标签暴露的如下属性自定义类名.
这在使用第三方动画库时十分有效.

* enter-active-class 定义进入类名
* leave-active-class 定义退出类名

除了 transition 标签还提供如下的事件来处理动画.

* before-enter 
* enter 
* after-enter 
* enter-cancelled 
* before-leave 
* leave 
* after-leave 
* leave-cancelled 

可以直接在 transition 标签所属的实例上定义方法来处理这些事件.

可以利用 Velocity.js 进行 js 动画绘制.


## 自定义指令





# 加载原理

![](https://cn.vuejs.org/images/lifecycle.png)

1. 创建 vue 实例.
2. 根据注册的 data 绑定监听数据
3. 初始化 vue 的事件体系
4. 根据绑定属性确定渲染逻辑
    * el 元素方式
    * component 组件方式
5. 对邦定元素进行扩展
6. 挂载数据到绑定元素上,并启动脏检查
7. 可以调用 destroy 销毁元素
8. 销毁之前取消脏检查,事假监听
9. 销毁 vue 实例

注意其中红色表示各阶段可以利用的钩子事件.

* beforeCreate 检测数据前,创建实例后
* created 实例创建后
* beforeMount 挂载脏检查前
* mounted 挂载脏检查后
* beforeUpdate 数据变化后,界面重绘前
* updated 界面重绘后
* beforeDestroy 实例销毁前
* destroyed 实例销毁后

## concept_bind_compare
默认为双向数据绑定,方法常见如下
* {{}} 不可用于 dom 属性,可以解析表达式
* v-bind 视图扩充属性和 dom 属性均可







