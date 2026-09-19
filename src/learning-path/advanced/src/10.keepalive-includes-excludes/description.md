> 版本: Vue 3.x | 状态: stable

# KeepAlive include / exclude / max

`<KeepAlive>` 是 Vue 的内置缓存组件，它能在切换时保留组件实例，避免重新创建。`include` / `exclude` 用于精细控制哪些组件被缓存，`max` 限制最大缓存数量。

## 这是什么

```vue
<KeepAlive :include="['PageA', 'PageB']" :max="10">
  <component :is="currentPage" />
</KeepAlive>
```

- `include`：字符串 / 正则 / 数组。匹配组件的 `name`，命中即缓存
- `exclude`：与 include 互斥逻辑
- `max`：超过数量时按 LRU 策略淘汰最久未使用的实例

## Vue 怎么实现

- 入口：`packages/runtime-core/src/components/KeepAlive.ts`
- 维护一个 Map<key, VNode> 缓存已卸载的组件实例；激活时直接复用
- 切换时调用 `queuePostFlushCb` 异步卸载/激活，触发 `activated` / `deactivated` 钩子
- `max` 通过 `cache.delete(keys[0])` 实现 LRU

## 实战中什么时候用 / 什么时候不用

**用**：

- 路由 `router-view` 包裹，避免 Tab 切换时反复销毁重建
- 步骤表单切换

**不用**：

- 数据极度敏感的页面（缓存可能保留旧数据）
- 表格分页等需要彻底刷新的场景

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/built-ins/keep-alive.html
- https://cn.vuejs.org/api/built-in-components.html#keepalive

## 常见踩坑

- `include` 默认匹配组件 `name` 选项，没有 `name` 时匹配失败
- 缓存后状态保留——务必确认符合业务需求
- `max` 不控制缓存时间，只控制数量

## 延伸阅读

- https://cn.vuejs.org/guide/built-ins/keep-alive.html
- https://cn.vuejs.org/api/built-in-components.html#keepalive
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/KeepAlive.ts
- https://cn.vuejs.org/api/composition-api-lifecycle.html#onactivated
- https://github.com/vuejs/rfcs/discussions/216
