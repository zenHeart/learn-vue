> 版本: Vue 3.2+ | RFC: — | 状态: stable (3.2+) | 概念: v-memo 列表性能

# v-memo 列表：跳过未变化的项

## 你会学到什么

- `<li v-memo="[item, selected]">` 只在数组项变化时重渲染该行
- 与 `key` 的差异：`key` 控制**复用**，`v-memo` 控制**重渲染**
- 与 `shallowRef` 大列表搭配的常见模式

## 真实场景（抽象）

千行表格，点击某行高亮；只希望高亮行重渲染，其他行保持 DOM 不动。

## 动手试

1. 点击某行选中 — 只有该行的样式更新，其他行没动（v-memo 生效）
2. 点击「整体替换数据」 — 数据引用换了，每行的 `item` 引用变了，所有行重渲染
3. 点击「修改未选中行」— 该行 item 引用变了，但 selected 不变，会触发 v-memo 重算（取决于实现）

## 根因

- `key` 只决定**复用哪个元素**，不阻止 vnode diff
- `v-memo="[item, selected]"` 把数组与 selected 都缓存，下次 patch 时若数组值与上次相同，**直接跳过子树的 vnode 创建**
- 大列表 + shallowRef + v-memo 是常见组合

## 修复 / 选型

- 行级数据稳定：v-memo 数组用 `[item]` 即可
- 行需要依赖外部状态：把外部状态加进 v-memo 数组
- 频繁整体替换数据：v-memo 收益减弱

## 延伸阅读

- [v-memo directive](https://vuejs.org/api/built-in-directives.html#v-memo)

## 小结

1. **现象**：列表项多时 patch 开销大。
2. **复现**：点击行只更新选中态。
3. **修复**：加 `v-memo="[...]"`。
