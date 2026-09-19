> 版本: Vue 3.2+ (v-memo) | 状态: stable

# 作用域插槽性能优化

内联的作用域插槽（如 `<Comp #default="x">{{ x.foo }}</Comp>`）每次父组件 re-render 时都会执行；通过 `v-memo` 或局部 computed 缓存可以减少不必要的工作。

## 这是什么

```vue
<HeavyList :items="list">
  <template #default="{ item }" v-memo="[item.id, item.version]">
    <Heavy :item="item" />
  </template>
</HeavyList>
```

`v-memo` 在 3.2+ 加入；只有数组中任一值变化时，对应插槽的子节点才会重新渲染。

## Vue 怎么实现

- 编译器：`packages/compiler-core/src/transforms/vMemo.ts` 把 `v-memo="[deps]"` 编译成 `withMemo(deps, render, cacheIndex)`
- 运行时：`packages/runtime-core/src/helpers/withMemo.ts` 比较新旧 deps 数组；相同则复用上次结果

## 实战中什么时候用 / 什么时候不用

**用**：

- 大列表 + 重型子节点
- 插槽依赖很多局部数据，但只有少数字段变化

**不用**：

- 子节点足够轻量
- 依赖项频繁变化——memo 失效，性能反而下降

## 官方文档延伸阅读

- https://cn.vuejs.org/api/built-in-directives.html#v-memo
- https://github.com/vuejs/rfcs/discussions/229

## 常见踩坑

- `v-memo="[]"` 表示永远不更新
- deps 必须用响应式值，否则比较失效

## 延伸阅读

- https://cn.vuejs.org/api/built-in-directives.html#v-memo
- https://github.com/vuejs/rfcs/discussions/229
- https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vMemo.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helpers/withMemo.ts
- https://cn.vuejs.org/guide/components/slots.html#scoped-slots
