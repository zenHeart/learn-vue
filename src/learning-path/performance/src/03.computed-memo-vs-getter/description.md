> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: computed memo vs getter 性能

# 模板表达式 vs computed：重渲染次数与依赖追踪

## 你会学到什么

- 模板里的 `{{ a + b + c }}` 与 `computed(() => a + b + c)` 在依赖追踪数量上的差异
- 模板表达式**每次重渲染都重算**；`computed` 仅在依赖变化时重算
- 用 `onTrack` 数依赖：模板 getter 不可观测，computed 可观测

## 真实场景（抽象）

一张表格展示用户列表，每行有「用户名 + 角色 + 标签」三段派生文本。两种实现：
- ① 模板里直接三段拼接
- ② 派生提到 `computed`，模板只读

## 动手试

1. 点击「切换用户列表引用」触发响应式更新
2. 观察「渲染回调次数」差异：① 会比 ② 多（任何字段变更都触发整行重算）
3. 点击「数依赖」看 `computed` 收集到的依赖数

## 根因

- 模板表达式编译成 render function：每次组件 update 都重新执行
- `computed` 把派生结果缓存，依赖未变直接返回缓存值
- 模板表达式内联多个 `get` 操作时，每次 update 都要重新走 Proxy trap

## 修复 / 选型

- 派生值在两处以上复用 → `computed`
- 仅一处用且依赖简单 → 模板表达式可接受
- 需要 watch 派生值 → 必须 `computed`（模板表达式拿不到引用）

## 延伸阅读

- [Computed Properties](https://vuejs.org/guide/essentials/computed.html)
- [Computed Debugging](https://vuejs.org/guide/extras/reactivity-in-depth.html#computed-debugging)

## 小结

1. **现象**：模板里写复杂表达式，列表卡顿。
2. **复现**：对比两种写法的「渲染次数」。
3. **修复**：派生提到 `computed`，模板只读。
