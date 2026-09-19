> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: KeepAlive include/excludes

# KeepAlive 缓存策略：include / max / LRU

## 你会学到什么

- `<KeepAlive :include="['TabA']">` 只缓存匹配 name 的组件
- `:max="10"` 启用 LRU 淘汰：超过 10 个被缓存时，最久未访问的实例销毁
- `onActivated` / `onDeactivated` 钩子的用途（fetch 暂停、滚动位置保存）

## 真实场景（抽象）

Tab 切换器：A / B / C / D / E，点击切换激活项。模拟 max=3 行为：缓存到第 4 个标签时，最久未访问的实例被销毁。

## 动手试

1. 依次访问 A → B → C → D → E
2. 当缓存超过 3 个时，**第一个被访问的（A）** 触发 `onDeactivated` 销毁
3. 再次切回 A：实例被重建，触发 `onActivated`
4. 在 console 看事件日志

## 根因

KeepAlive 内部用 Map 缓存组件实例 + LRU 计数器。`:max` 触发淘汰时按最近访问时间排序，砍掉头部。

## 修复 / 选型

- 路由级 Tab：`<KeepAlive :include="route.meta.cacheable ? 'TabX' : ''">`
- 滚动位置保留：把 `scrollTop` 存到组件实例，`onActivated` 时还原
- 数据 fetch：`onActivated` 续上、`onDeactivated` 暂停轮询

## 延伸阅读

- [KeepAlive](https://vuejs.org/guide/built-ins/keep-alive.html)

## 小结

1. **现象**：Tab 切换丢状态。
2. **复现**：用 max=3 触发 LRU。
3. **修复**：include / max 控制缓存粒度。
