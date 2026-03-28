# Vue Computed 与异步数据的交互机制 - 任务定义

## 任务目标

创建技术文档和交互式演示，深入讲解 Vue 3 中 Computed 与异步数据的交互机制。

## 任务背景

在 Vue 3 的 Composition API 中，Computed 是一个强大的响应式计算属性。但当它与异步数据结合时，开发者经常遇到：
- 异步数据返回后，Computed 不触发重新计算
- Computed 依赖的响应式数据在异步回调中被修改，但变化不生效
- 根因：setup 执行时异步请求还未返回，computed 闭包已建立

## 交付物清单

### 1. 技术文档
- **路径**: `D:\chengle\code\github\learn-vue\docs\vue\advanced\vue-computed-async.md`
- **状态**: ✅ 已完成
- **内容**:
  - Vue 响应式原理（reactive vs ref）
  - Computed 实现原理（lazy evaluation、dirty flag）
  - 异步数据与 Computed 的交互机制
  - Watch vs Computed 区别
  - 常见踩坑场景和解决方案（5个场景）
  - 最佳实践

### 2. 交互式演示页面
- **路径**: `D:\chengle\code\github\learn-vue\examples\vue3\demos\vue-computed-async\index.html`
- **状态**: ✅ 已完成
- **内容**:
  - 演示1：Computed 依赖异步数据
  - 演示2：Computed 闭包建立时机
  - 演示3：Watch vs Computed 的区别
  - 演示4：异步修改数组/对象
  - 演示5：嵌套异步导致的时序问题
  - 演示6：使用 watchEffect 处理异步

## 验收标准

### 文档验收
- [x] 覆盖 Vue 响应式原理（reactive vs ref）
- [x] 解释 Computed 实现原理（lazy evaluation、dirty flag）
- [x] 阐述异步数据与 Computed 的交互机制
- [x] 明确 Watch vs Computed 的区别和使用场景
- [x] 提供 5+ 个常见踩坑场景和解决方案
- [x] 包含代码示例和完整解释
- [x] 包含总结和最佳实践

### 演示验收
- [x] 6 个独立演示场景
- [x] 可交互的操作按钮
- [x] 实时日志输出
- [x] 视觉效果清晰
- [x] 可在浏览器中直接运行

### Git 验收
- [ ] 创建 PR 到 zenHeart/learn-vue 仓库
- [ ] PR 包含文档和演示两个文件
- [ ] PR 描述清晰

## 技术细节

### Computed 核心特性
1. **懒求值（Lazy Evaluation）**: 只有被访问时才计算
2. **缓存（Caching）**: 依赖不变时返回缓存值
3. **脏标记（Dirty Flag）**: 依赖变化时标记为需重新计算

### 关键区别
| 特性 | Computed | Watch |
|------|----------|-------|
| 用途 | 派生值 | 副作用 |
| 缓存 | ✅ | ❌ |
| 异步支持 | ❌ | ✅ |
| 访问旧值 | ❌ | ✅ |

## 相关资源

- Vue 3 官方文档: https://vuejs.org/
- 相关文档: [Vue Watch 异步数据首次渲染不触发](./vue-watch-async-first-render.md)

## 状态

- **创建时间**: 2026-03-28
- **最后更新**: 2026-03-28
- **状态**: 待提交 PR
