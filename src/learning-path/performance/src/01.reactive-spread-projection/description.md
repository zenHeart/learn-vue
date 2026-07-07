# 在 computed 里 spread 响应式对象

## 你会学到什么

用 **10 行以内的最小 demo**，看清一件事：在 `computed` 里对 `reactive` 对象做 `{ ...item }` 展开，会让 Vue **为每个字段都注册依赖**——列表一大，就会变慢。

## 问题是什么？

想象你在做**分页列表**：后台返回很多条记录，每条有很多字段。你想在 `computed` 里把它们「拼」成展示用的结构：

```js
// ❌ 常见写法
computed(() =>
  ids.map(id => ({ ...store.get(id), userList: store.get(id).members }))
)
```

`item` 是 `reactive` 代理。展开时 Vue 要**逐键读取**并**逐键收集依赖**。  
若有 50 条 × 40 个字段，一次求值就可能注册 **约 2000 个依赖**——这不是 bug，是 Proxy 响应式的正常行为。

## 动手试（像官方 Tutorial 一样）

<div class="lp-variants">
  <button type="button" data-lp-variant="default" class="lp-variant active">① 问题代码</button>
  <button type="button" data-lp-variant="hint" class="lp-variant">② 优化代码</button>
</div>

1. 先看右侧 **① 问题代码**，点击预览区的 **「统计依赖数」**——记下数字。
2. 再点上方 **② 优化代码**，右侧 REPL 会换成 `toRaw` 写法，再统计一次。
3. 对比两次数字，再点 **「测一次耗时」** 感受差距。

> 右侧代码刻意保持短小，方便对照。核心差异只有 `buildProjection` 函数里的几行。

## 最小复现

问题就出在这一行（见 `listProjectionModel.js`）：

```js
.map(item => ({ ...item, ...(item.meta || {}), userList: item.memberList }))
//              ^^^^^^^^ 展开 reactive → 每个键都触发 get trap + 依赖注册
```

本 demo 用 **10 条 × 15 字段** 的玩具数据。依赖数大约 **150+**；换成 100 条 × 40 字段，就会到 **4000+**。

## 如何解决？

```js
.map(item => {
  const raw = toRaw(item)           // 读原始对象，不走 proxy trap
  return {
    ...raw,
    ...(raw.meta || {}),
    memberList: item.memberList,     // 需要响应式的字段保留引用
    userList: item.memberList,
  }
})
```

**三个要点：**

| 要点 | 说明 |
|------|------|
| 只读投影用 `toRaw` | 避免在 computed 里逐键追踪大对象 |
| 变更要「换对象」 | 更新条目时 `map.set(id, { ...raw, ...patch })`，不能原地改字段后指望投影刷新 |
| 子列表保留引用 | `memberList` 仍用 reactive 上的引用，行内 `splice` 才能局部更新 |

## 延伸阅读

| 资源 | 内容 |
|------|------|
| [Performance — 大结构响应式开销](https://vuejs.org/guide/best-practices/performance.html#reduce-reactivity-overhead-for-large-immutable-structures) | 官方性能建议 |
| [toRaw()](https://vuejs.org/api/reactivity-advanced.html#toraw) | API 说明 |
| [Computed Debugging](https://vuejs.org/guide/extras/reactivity-in-depth.html#computed-debugging) | 用 `onTrack` 量化依赖 |
| [vuejs/vue#6660](https://github.com/vuejs/vue/issues/6660) | computed 依赖累积讨论 |
| [vuejs/core#13613](https://github.com/vuejs/core/issues/13613) | toRaw 失效边界（换对象契约） |

## 小结

1. **问题**：computed 内 spread reactive → 依赖数 O(项数 × 字段数)。
2. **复现**：点 ① → 统计依赖数；放大项数/字段数会更明显。
3. **修复**：`toRaw` 浅拷贝 + 写入口换对象 + 保留需响应式的引用。
