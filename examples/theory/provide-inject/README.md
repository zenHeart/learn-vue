[provide/inject](https://cn.vuejs.org/v2/api/#provide-inject)

===

利用该 api 实现如下功能.

1. 父组件向所有子组件传递初始配置,
多用于框架的主题配置.
2. 注意传值方式,组件内默认值必须采用函数进行传递.
* [ ] 为什么 inject 需要采用函数才可注入?

参考 [props 验证](https://cn.vuejs.org/v2/guide/components-props.html#Prop-%E9%AA%8C%E8%AF%81)
由于会先验证 props 类型,所以 default 的值无法访问 data,computed 等属性,若需访问可采用函数 default
