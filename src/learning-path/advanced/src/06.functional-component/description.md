> 版本: Vue 3.0+ | RFC: 0009-functional-component | 状态: deprecated | 概念: 函数式组件

# Vue 3 函数组件示例

该示例展示了 Vue 3 中函数组件的使用方法和最佳实践。

## 功能说明
- 函数组件的定义和使用
- 函数组件的性能优化
- 函数组件的状态管理
- 函数组件的生命周期

## 学习要点
- 函数组件的创建方式
- 函数组件的性能优势
- 函数组件的状态处理
- 函数组件的生命周期钩子

## 关键特性
- 函数组件
- 性能优化
- 状态管理
- 生命周期 

## 迁移指引 {#migration}

Vue 3 中函数式组件的 `functional` 选项已被移除。
官方推荐替换为：

- **普通函数组件**：直接用 `function MyComponent(props, { slots }) { return h(...) }`，无需 functional 字段
- **更轻量的方案**：`<script setup>` 单文件组件（性能与函数组件接近，工具链更友好）
- **极致性能**：在 `compiler-sfc` 关闭运行时开销，用 `defineComponent` + `setup`

参考：[Vue RFC 0009](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0009-functional-component.md) 说明 functional 标记在 Vue 3 不再需要。
