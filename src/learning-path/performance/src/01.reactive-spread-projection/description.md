# 列表投影性能：spread 响应式代理

## 场景

大型虚拟列表在分页加载时，需要把事实层数据投影为展示层结构。常见写法是在 `computed` 中对 `reactive` 实体做对象展开（spread），这在项数 × 字段数较大时会引发严重的依赖收集开销。

## 问题是否存在？

**是真实存在的机制问题，不是 Vue bug。**

Vue 3 Proxy 响应式在 `computed` getter 中**按属性访问逐键收集依赖**是设计行为。官方文档从多个角度覆盖了同类风险：

| 文档 | 说明 |
|------|------|
| [Performance - 大结构响应式开销](https://vuejs.org/guide/best-practices/performance.html#reduce-reactivity-overhead-for-large-immutable-structures) | 大量属性访问会触发 proxy trap |
| [toRaw()](https://vuejs.org/api/reactivity-advanced.html#toraw) | 读取时避免 proxy 追踪开销的逃生舱 |
| [Computed Debugging](https://vuejs.org/guide/extras/reactivity-in-depth.html#computed-debugging) | `onTrack` 可量化依赖规模 |
| [Computed Stability](https://vuejs.org/guide/best-practices/performance.html#computed-stability) | 每次返回新对象导致下游无法短路 |

## 相关 GitHub Issue

| Issue | 关联 |
|-------|------|
| [vuejs/vue#6660](https://github.com/vuejs/vue/issues/6660) | computed 求值时构建依赖的成本 |
| [vuejs/core#13613](https://github.com/vuejs/core/issues/13613) | toRaw 绕过追踪的边界（修复契约必读） |
| [vuejs/core#9497](https://github.com/vuejs/core/issues/9497) | 对象引用不稳定导致多余更新 |
| [vuejs/rfcs#145](https://github.com/vuejs/rfcs/issues/145) | spread/destruct reactive 的已知敏感区 |

> 没有标题完全匹配的官方 issue——这是「高频 computed + 大列表 spread」的复合反模式，需结合文档与 `onTrack` 调试定位。

## 根因

```js
// ❌ 在 computed 内 spread reactive 实体
.map((item) => ({ ...item, ...item.meta, userList: item.memberList }))
```

每次 spread 对每个键触发 `get` / `ownKeys` trap，并**逐键注册 computed 依赖**。依赖规模 O(项数 × 字段数)。

## 修复：raw 快照派生

```js
// ✅ toRaw 浅拷贝 + 保留响应式 memberList 引用
.map((item) => {
  const raw = toRaw(item)
  return Object.freeze({
    ...raw,
    ...(raw.meta || {}),
    memberList: item.memberList,
    userList: item.memberList,
  })
})
```

### 失效契约

| 变更 | 写入方式 | 投影重算 |
|------|----------|----------|
| 字段内容 | `itemMap.set` 新对象 | ✅ |
| 增删项 | `orderedIds` 变更 | ✅ |
| 成员列表 | `memberList.splice` | ❌（靠行内引用） |

实体内容变更必须**换对象写入**，不能绕过写入口原地改字段（参见 core#13613）。

## Demo 操作

1. **关闭优化** → 点击「统计依赖数」→ 记录数值
2. **开启优化** → 再统计 → 依赖数应大幅下降
3. 分别运行「基准测试 ×30」对比耗时
4. 试「模拟分页」「字段更新」「成员更新」观察重建次数

## 经验

1. 高频 computed 避免 spread reactive 代理
2. 只读投影用 toRaw + 键级失效契约
3. 原地 mutation 字段保留响应式引用
4. 用 `onTrack` 写失败单测证明依赖规模
