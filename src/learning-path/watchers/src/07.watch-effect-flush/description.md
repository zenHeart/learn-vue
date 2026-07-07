# watchEffect flush 示例

这个示例展示了 Vue 3 中 watchEffect 的 flush 选项，用于控制副作用函数的执行时机。

## 功能说明
- 使用 flush 选项控制执行时机
- 支持 post、sync、pre 三种模式
- 组件生命周期与 watchEffect 的关系
- 响应式数据的更新时机

## 学习要点
- watchEffect 的 flush 选项
- 不同 flush 模式的区别
- 组件生命周期钩子的执行顺序
- 响应式数据的更新机制

## 关键特性
- post 模式：在组件更新后执行
- sync 模式：同步执行
- pre 模式：在组件更新前执行
- 组件生命周期的调试 