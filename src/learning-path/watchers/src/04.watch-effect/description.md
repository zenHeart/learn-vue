> 版本: Vue 3.0+ | RFC: 0001-composition-api | 状态: stable | 概念: watchEffect

# watchEffect 基础示例

这个示例展示了 Vue 3 中 watchEffect 的基本使用方法。

## 功能说明
- 使用 watchEffect 自动监听数据变化
- 监听 props 和响应式数据
- 自动依赖收集和触发

## 学习要点
- watchEffect 的基本用法
- 自动依赖收集机制
- 响应式数据的监听
- props 的监听方式

## 关键特性
- 自动收集依赖
- 立即执行回调
- 支持多个数据源
- 响应式数据的自动追踪 

## 延伸阅读

- [Vue 源码洞察：watchEffect / watch 的调度时机](_analysis/vue-source-insights.md#watcheffectwatch的调度时机) | `packages/runtime-core/src/apiWatch.ts, scheduler.ts:88-117` 引用