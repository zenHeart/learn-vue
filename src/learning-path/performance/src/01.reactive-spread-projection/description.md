# 在 computed 里 spread 响应式对象

## 你会学到什么

复现**虚拟列表滚到底加载下一页时卡顿**：主线程被投影重算堵住，列表迟迟刷不出新行。

## 真实场景（抽象）

1. 首屏拉取约 200 条，每条实体有 120 个字段（存在 `reactive` Map 里）
2. `computed` 把事实层投影成展示列表
3. 用户滚到底 → `loadMore` merge 新一页 → `orderedIds` 变更 → **整表投影重算**
4. spread `reactive` 代理时，重算逐键 `get` + 注册依赖 → **主线程长任务**

本 demo 用 **200 条 × 120 字段** 放大规模，首次 `loadMore` 在 dev REPL 中可达 **100ms+**。

## 动手试

<div class="lp-variants">
  <button type="button" data-lp-variant="default" class="lp-variant active">① 问题代码</button>
  <button type="button" data-lp-variant="hint" class="lp-variant">② 优化代码</button>
</div>

1. 打开 **① 问题代码**，点 **「滚到底加载下一页」**
2. 观察 **上次分页加载** 跳到 100ms+、**依赖数** 飙到数万
3. 切 **② 优化代码** 重复 — 耗时骤降、依赖数 &lt; 项数×8

> 多滚几次：列表越长，整表投影重算成本累加。

## 根因

问题出在 `buildProjectionBad` 的 `map` 回调里对 `reactive` 实体做 spread：

```js
export function buildProjectionBad(store) {
  return store.orderedIds
    .map((id) => store.itemMap.get(id))
    .filter(Boolean)
    .map((item) => ({
      ...item,              // spread reactive：每键 get trap + 依赖注册
      ...(item.meta || {}),
      userList: item.memberList,
    }))
}
```

分页每次 merge 都触发整表重算，依赖规模 **O(项数 × 字段数)**。

## 修复

```js
import { toRaw } from 'vue'

export function buildProjectionOptimized(store) {
  return store.orderedIds
    .map((id) => store.itemMap.get(id))
    .filter(Boolean)
    .map((item) => {
      const raw = toRaw(item)
      return {
        ...raw,
        ...(raw.meta || {}),
        memberList: item.memberList,
        userList: item.memberList,
      }
    })
}
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

1. **现象**：滚到底加载下一页卡顿，是投影重算堵住主线程。
2. **复现**：① 滚到底 → 看分页耗时是否 100ms+。
3. **修复**：`toRaw` + 换对象契约；② 对比即证。
