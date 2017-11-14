# 脏值检测
遍历节点所有属性.
将 `data` 设置为 `setter` 和 `getter`.
当调用 setter 方法时利用 watcher 进行通知.

![](https://cn.vuejs.org/images/data.png)

1. 遍历 dom 节点属性,将 data 作为访问器属性添加到
虚拟 dom 节点
2. 调用 setter 访问器,通知给观察器重新调用渲染函数重绘节点
3. 渲染函数触发 touch 事件,调用 getter 属性获取访问值,
通知给观察器,再次调用渲染函数进行重绘.

* 视图层->数据层 ui 事件
* 数据层->视图层 访问器属性触发

利用 watcher作为中间层传递变化.

由于 data 属性的绑定是在实例化时完成.
后续添加的属性无法触发检测.

**对于需要监控的变量保证在实例化 vue 时创建**

若需要动态添加可以使用 `Vue.set` 在实例内部使用 `this.$set` 也可引用该方法. 

> 好的开发习惯是在实例化初期定义响应式属性

脏值检测过后,vue 不会立即刷新.
而是会把变化推进刷新队列.
在下一个周期统一渲染.

若期望在刷新之后进行额外的操作可以使用

```js
Vue.nextTick(function() {
  if(vm.$el.textContent) {
     //逻辑处理代码
  }
}) 

//等同于 this.$nextTick 方法
```

