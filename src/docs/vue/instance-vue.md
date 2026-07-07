# 实例控制

## optionMergeStrategies 
用来修改属性的合并策略,例如 `created` 的生命周期钩子
和 methods 合并策略就有区别。
* `created` 会合并为数组顺序执行
* `methods` 会深度合并并且子组件内容会覆盖父组件传入内容。

参考 [Suggestion: Using component options for passing plugin configuration](https://github.com/vuejs/vue/issues/1271)


* [ ] 入参何时有