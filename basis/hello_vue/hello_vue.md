## hello_vue
1. 加载 vue 脚本
2. 直接创建 vue 对象.

* Vue vue.js 暴露出来的核心对象
* el 用来绑定视图
* data 定义视图数据
* `{{}}` 用来解析模板变量

初步使用感觉类似 angular.

## hello_vue_bind
类似上例.
其中绑定方式变成了 `v-bind:title`.
该方式类似于 `angular` `ng-bind` 指令.

## hello_vue_if
采用 v-if 指令控制视图的显示和隐藏.
类似 `ng-if`

## hello_vue_for
采用 v-for 重复指令绑定的元素.
类似 `ng-repeat` .

后续要查看是否支持类 angualr 的 `$index` 索引.
等.

在控制台利用 `app.todos` 可以直接访问到变量.
`app.todos.push('test')` 会在视图之后添加新列表.

相比于 angular 采用 `angular.element('select-name').scope()`
的方式,vue 更简洁.

## hello_vue_on
* v-on:click 用于添加 click 事件绑定,类似 `ng-click`
* method 用于定义事件方法

相比 angular 绑定.
vue 更直观.主要体现在
申明式的方法定义.缩减了 angular 需要
理解 `controller`,`scope` 的概念负担. 


## hello_vue_model
* v-model 用于绑定表单输入元素

类似 `ng-model`,同样为双向数据绑定.
后面需要了解 vue 脏值检测和 angular 区别.

## hello_vue_component
* Vue.component 用来定义组件
    * `todo-item` 为组件名
    * props 定义组件对外暴露属性
    * template 定义组件模板

* v-bind:todo 用来将视图中的变量绑定到组件的 `todo` 属性上.

组件的定义类似 angular `directive`.


## 问题
1. 模板数据的作用域?
2. 模板的选择器支持?
3. 模板元素的绑定方式?