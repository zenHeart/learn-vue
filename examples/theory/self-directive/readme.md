自定义指令
====

**详解自定义指令的使用**

------

## 定义指令
指令的定义包括局部和全局两种.
分别举例如下

### 全局指令
采用 `Vue.directive` 定义
参见 [global-init.js](./global-init.js)

### 局部指令
在 `directives` 中定义指令

### 指令格式
设置一个指令的格式如下

```js
 export default {
    directives:{
        '<键名>':{
           '<钩子事件>':(ele,binding) => {
           } 
        }
    }
 }
```

> 配置中键名即为指令名,引用时采用 v-<键名> 的方式引用.

指令执行支持如下 [钩子事件](https://cn.vuejs.org/v2/guide/custom-directive.html#%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0)

* **bind** 只调用一次,绑定到元素时调用,这里进行初始化配置
* **inserted** 绑定元素插入父节点时调用
* **update** VNode 跟新是调用
* **componentUpdated** VNode 及其子 Vnode 全部更新后调用
* **unbind** 指令与元素解绑时调用

传入的元素如下
* **el** 指令所绑定的元素,可直接操作 dom
* **binding** 一个对象
    * **name** 指令名,没有 `v-` 前缀
    * **value** 指令绑定的值,该值会尝试解析否则返回 undefined
    * **oldValue** 绑定前一个值,在 update,componentUpdated 钩子中可用
    * **expression** 绑定内容的字符串形式
    * **arg** 传给指令的参数
    * **modifiers** 包含修饰符的对象
* **vnode** Vue 编译生成的虚拟节点,参看  [vnode](https://github.com/vuejs/vue/blob/dev/src/core/vdom/vnode.js)
* **oldVnode** 上一个 Vnode 节点,仅在 update,componentUpdated 钩子中可用

> 解析指令传入参数时,若为字符串使用 **expression**
否则采用 value 解析.此时传入的值支持所有合法的 json 表达式.



> 除了 el,其他参数均为只读,切勿修改

使用如下模式默认绑定 **bind** 和 **update** 事件.

```js
Vue.directive('color-swatch',function(el,binding) {
el.style.backgroundColor = binding.value;
}) 
```
