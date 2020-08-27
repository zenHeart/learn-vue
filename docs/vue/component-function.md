# 函数组件
**前言:详解 vue component 的使用**

---


## 知识点
* 函数组件的表现形式
  * js 文件
  * sfc 文件
    * 采用 template
    * 采用 render
  * 上述两种方式采用 jsx 
* 函数组件支持返回多 root 组件,**sfc 文件不支持此特性**
* 函数组件内容无实例,需采用 render(h,ctx), 获取当前的实例数据
* 函数组件无实例不具备如下特性
  * 计算属性
  * data
  * 函数组件无生命周期钩子
  * components
  > 所有依赖于实例的配置均不支持
  
* [ ] 函数组件无法使用 components 属性,详见 [0007-functional-async-api-change](https://github.com/vuejs/rfcs/blob/functional-async-api-change/active-rfcs/0007-functional-async-api-change.md),有无法使用 components,直接在 render 函数内部使用其他函数组件或者全局注册即可。
