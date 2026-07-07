# vue 运行浅析

**利用浏览器版本分析 vue 的源码**


----

## vue 源码浅析
1. 采用 `new Vue(options)` 示例化一个 vue 对象
   1. 利用 `instanceOf` 检查是否采用 new 调用 this,避免非构造器模式使用 new
2. 内部调用 `thi._init(options)` 实例化对象,该方法附着在 Vue 构造器的原型上
   1. this._uid 标识
		> uid 的作用?
   2. this._isVue 标识
		> 避免对 Vue 对象的观察
   3. 判断是否为组件
      1. 组件调用组件实例化
      2. 非组件合并传入配置项添加 `$options` 属性,绑定了 Vue 内置的组件特性,核心特性包括
         1. `$options.components` 原型上继承如下组件
            1. `keepAlive`
            2. `Transition`
            3. `TransitionGroup`
         2. `$options.directives`,原型继承如下指令 
            1. `model` 表单指令
            2. `show` 显示指令
         3. `initProxy(vm)` 代理实例化的 vue 对象
         	1. 在实例上设置 `has` 代理,检查自定义 vm 属性是否合法,包括如下几种
            	1. key 必须为字符串
            	2. key 不存在与 `vm.$data` 字段
         4. `initLifecycle(vm)` 初始化 vm 的组件树结构
         5. `initEvents(vm)` 初始化 vm 上绑定的时间监听组
         6. `initRender(vm)` 
            1. 绑定渲染函数
            2. `defineReactive$$1` 绑定响应式数据
         7. `callHook(vm,'beforeCreate')` 触发创建前钩子
         8. `initInjections(vm)` 功能不清楚？？？
         9. `initState(vm)` 检验 vm 相关属性
            1. 检验属性
            2. 检验方法
            3. 检验data,并将 `vm.$data` 上的属性代理到 vm 对象上,实现直接利用 vm.xx 访问 `$data` 上属性的功能
            4. 观察 `observe(data)`
         10. `initProvide` 解析 provide 属性
         11. `callHook(vm, 'created');` 绑定观察者后触发 `created` 钩子
         12. 若定义了 `el` 触发挂载 `$mount` 方法

## 数据跟新流程
### 读取流程
1. 利用 `this.xx` 读取组件 data 属性会触发 `proxyGetter` 陷阱函数,该陷阱函数会返回 `this._data[key]` 的结果
2. 访问 `this._data[key]` 触发 `reactiveGetter` 访问器返回该值

### 写入流程
1. 利用 `this.xx` 修改写入组件 data 属性时会触发 `proxySetter` 陷阱函数,该陷阱函数会设置 `this._data[key]` 的值
2. 设定值会触发 `reactiveSetter` 访问器属性,若检测到值得变化才会触发通知
3. 值的变化会触发 `dep.notify()` 的通知,通知会遍历 `dep.subs` 上的观察者,调用观察者的 `update()` 方法
4. 进一步调用 `queueWatcher`  将当前观察者推入,该步骤会清除对同于属性的多次修改
5. 调用 `nextTick(flushSchedulerQueue)` 处理被推入的更新队列
	> 注意该操作为异步,默认采用 Promise.resolve 触发
6. 遍历执行队列中 `watcher.run()` 方法
7. `watcher.run()` 触发内部的 render 函数,更新视图

