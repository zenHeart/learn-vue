> 版本: Vue 3.5+ | RFC: — | 状态: stable (3.5+) | 概念: watch deep 范围

# watch deep 过度触发

## 你会学到什么

- `deep: true` 会遍历对象每个字段注册依赖，**任何子字段变更都触发**
- `deep: number`（3.5+）限制递归深度
- `getter: () => obj.field` 把监听范围精确到单字段

## 错误示例

```js
const state = reactive({ user: { name: 'A', addr: { city: 'BJ' } } })
watch(state, () => console.log('changed'), { deep: true })
state.user.addr.city = 'SH'  // 触发
```

## 修复版本（3.5+）

```js
watch(() => state.user, () => console.log('user changed'), { deep: 2 })
// 或更精确
watch(() => state.user.addr.city, (next) => console.log(next))
```

## 动手试

1. 点击「错误：deep:true 改深层」 — 触发回调
2. 点击「修复：deep:2 改第 3 层」 — 不触发
3. 点击「修复：getter 精确字段」 — 仅字段变更触发

## 根因

`deep: true` 在初始化时遍历所有 key 注册 effect，**N 个字段 = N 个 dep**。任何子节点变更都通知 watcher。

## 修复 / 选型

- 大对象：拆分多个 `watch(() => obj.xxx, ...)`
- 3.5+：`deep: number` 限制深度
- 不变结构：用 `markRaw` 跳过代理

## 延伸阅读

- [Watch — deep](https://vuejs.org/guide/essentials/watchers.html#deep-watchers)

## 小结

1. **现象**：watch 触发次数过多。
2. **复现**：deep:true 改深层。
3. **修复**：getter + 精确字段。
