# 在 computed 里 spread 响应式对象

## 你会学到什么

复现**虚拟列表滚到底加载下一页时卡顿**：不是抽象的数字，而是主线程被阻塞、列表迟迟刷不出新行。

## 真实场景（抽象）

分页列表的典型链路：

1. 首屏拉取约 80 条，每条实体有五十多个字段（存在 `reactive` Map 里）
2. `computed` 把事实层投影成展示列表：`ids.map(id => ({ ...entity, userList: entity.members }))`
3. 用户滚到底 → `loadMore` merge 新一页 → `orderedIds` 变更 → **整表投影重算**
4. spread `reactive` 代理时，重算要对每条逐键 `get` + 注册依赖 → **主线程长任务** → 动画卡住、下一页迟迟不出现

线上 Profile 里这类投影可占数秒；本 demo 用 **80 条 × 53 字段** 等比缩小，在 dev 模式 REPL 中连续分页可感到百毫秒级阻塞。

## 动手试

<div class="lp-variants">
  <button type="button" data-lp-variant="default" class="lp-variant active">① 问题代码</button>
  <button type="button" data-lp-variant="hint" class="lp-variant">② 优化代码</button>
</div>

1. 打开 **① 问题代码**，点预览区 **「滚到底加载下一页」**（或手动滚到底）
2. 观察：**流畅度指示器**转圈卡住、**上次分页加载**跳到 80ms+、**依赖数**飙到 2000+
3. 切换到 **② 优化代码**，重复操作 — 加载更快、指示器不停、依赖数 &lt; 项数×8

> **提示**：多滚几次。每加载一页，列表变长，整表投影重算成本累加——这正是线上下拉卡顿的原因。

## 根因（一行）

```js
.map(item => ({ ...item, ...(item.meta || {}), userList: item.memberList }))
//              ^^^^^^^^ spread reactive → 每键 get trap + 依赖注册
```

分页每次 merge 都触发整表重算，依赖规模 **O(项数 × 字段数)**。50 条 × ~50 键 ≈ **2500+** 依赖。

## 修复

```js
.map(item => {
  const raw = toRaw(item)
  return {
    ...raw,
    ...(raw.meta || {}),
    memberList: item.memberList,
    userList: item.memberList,
  }
})
```

| 要点 | 说明 |
|------|------|
| `toRaw` 浅拷贝 | 投影只读，不逐键追踪 |
| 换对象写入 | 字段更新走 `map.set(id, { ...raw, ...patch })` |
| 保留 `memberList` 引用 | 成员 `splice` 由消费组件追踪，不整表重算 |

## 延伸阅读

| 资源 | 内容 |
|------|------|
| [Performance — 大结构响应式开销](https://vuejs.org/guide/best-practices/performance.html#reduce-reactivity-overhead-for-large-immutable-structures) | 官方建议 |
| [toRaw()](https://vuejs.org/api/reactivity-advanced.html#toraw) | API |
| [Computed Debugging](https://vuejs.org/guide/extras/reactivity-in-depth.html#computed-debugging) | `onTrack` 量化依赖 |
| [vuejs/core#13613](https://github.com/vuejs/core/issues/13613) | toRaw 失效边界 |

## 小结

1. **现象**：滚到底加载下一页卡顿，不是网络慢，是投影重算堵住主线程。
2. **复现**：① 滚到底 → 看分页耗时 + 流畅度指示器。
3. **修复**：`toRaw` + 换对象契约；② 对比即证。
