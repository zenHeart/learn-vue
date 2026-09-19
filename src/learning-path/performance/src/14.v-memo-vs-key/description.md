# v-memo vs v-for :key：微观性能基准对比 {#v-memo-vs-key}

> **版本**：Vue 3.2+ | **状态**：stable | **源码**：`packages/compiler-core/src/transforms/vMemo.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/built-in-directives.html#v-memo)

`v-for :key` 已经能让 Vue 在节点位置复用 DOM；`v-memo` 在它之上做「依赖未变就跳过 vnode patch」。两者的真实差异在「大列表 + 每行有响应式状态」的场景里显现：

- **`:key` + 默认 patch**：复用 DOM，但 patch 函数还是会跑一次（比对子属性、调用 v-on 回调）。
- **`:key` + `v-memo="[dep]"` 命中**：缓存命中 → 跳过整个 patch 函数。

本 demo 用 1000 行表单（输入框联动）做微观基准：每次按一次按钮，**只有 1 行发生变化**，测量两种写法的总耗时。

## 这是什么 {#what}

```vue
<!-- 写法 A：单 key + 默认 patch -->
<input v-for="row in rows" :key="row.id" v-model="row.text" />

<!-- 写法 B：key + v-memo（命中就跳过） -->
<input v-for="row in rows" :key="row.id" v-memo="[row.id, row.dirty]" v-model="row.text" />
```

## 源码走读 {#source}

```ts
// packages/compiler-core/src/transforms/vMemo.ts (节选)
// 编译器把 v-memo="[deps]" 翻译成：
// if (_cache[key] && shallowEqual(_cache[key].memo, deps)) return _cache[key]
// _cache[key] = newVNode; _cache[key].memo = deps
```

关键事实：

- `v-memo` 用 `shallowEqual`（Object.is 数组）比较依赖数组。
- 缓存命中时**整个 vnode patch 被跳过** —— 既不调子组件 setup 回调，也不调 v-on；但**响应式订阅仍照常建立**（v-memo 只优化渲染层）。
- 适合的场景：**节点子树里大部分值都不随本次更新变化**（如表单列、行号列）。

## 实战场景 {#production}

1. **大列表 + 列细分联动**：表格 + 联动选择器；用户操作选择器时只有一行的 UI 变化。
2. **Canvas / 图表列表**：每个图表 v-memo="[rowData, isActive]" 避免重复设置。
3. **静态内容为主的列表**：列表项是「结构固定 + 单字段变化」（如价格、状态灯）。

## 常见踩坑 {#pitfalls}

- **不要 memo 整个 row 对象**：每次 `rows.value = [...rows.value, new]` 时新对象都不同，破坏命中。
- **依赖数组尽量小**：1-2 个原子字段最佳；3 个以上会摊薄命中收益。
- **v-memo 不优化 setup 副作用**：组件 setup 内 watchEffect / computed 仍照常跑。
- **不要把 memo 节点包在 `<Transition>` 里**：v-memo 命中时不会触发 transition hooks。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/built-in-directives.html#v-memo) | API 文档 |
| [Vue 源码 · vMemo.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vMemo.ts) | 编译实现 |
| [Vue 源码洞察：v-memo 与 vnode cache](_analysis/vue-source-insights.md#v-memo-cache) | 隐式经验 |