# composition api

## vue 2 中使用
### 全局中使用
1. 安装 `@vue/composition-api`
2. 采用 `Vue.use` 使用插件

### 库中使用
1. 声明为 `peer-depency` 即可

## API 详述
### reactive
注意使用 reactive 设定初始值
1. 避免直接使用初始对象,因为采用代理模式,对响应对象的修改会复制到初始对象上
对于浅层次对象直接使用对象扩展语法复制对象
2. 由于对象扩展对于深度引用的对象采用深拷贝在赋值解决,注意下次使用仍继续使用
深拷贝解决


框架层面建议初始赋值时使用 deepClone 解决对原始值修改的问题!

避免引用丢失,不要直接对整个 state 赋值,这样会导致响应式丢失

## 最佳实践
### 共享状态
将状态定义在外部,实现局部状态共享,示例参见 [局部状态共享](../../examples/vue3/demos/share-state/index.vue)


### 如何复位状态
参考 [reset reactive](https://github.com/vuejs/vue-next/issues/1081#issuecomment-621385050)