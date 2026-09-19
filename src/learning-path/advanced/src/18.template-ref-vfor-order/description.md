> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/rendererTemplateRef.ts:155-172` | **延伸阅读**：[Vue 官方 · 模板 Ref](https://cn.vuejs.org/guide/essentials/template-refs.html)

# v-for 中 ref 数组的收集顺序

## 这是什么

`ref="elRefs"` 写在 `v-for` 上时，Vue **不会**按数组声明顺序填充 `elRefs.value`，而是按 **patch 后 DOM 的实际顺序** 收集（rendererTemplateRef.ts:155-172）。

源码：

```ts
// rendererTemplateRef.ts
if (!isArray(existing)) {
  refs[ref] = [refValue]
} else if (!existing.includes(refValue)) {
  existing.push(refValue)   // 追加到末尾
}
```

这里 `refValue` 是单个 VNode 在 patch 阶段被传入 `setRef()` 的——而 `setRef()` 是 patch 后由 `queuePostRenderEffect` 在 post 队列中调度的（rendererTemplateRef.ts:188-198）。也就是说，**v-for 内的 ref 收集发生在 patch 完成后，按 DOM 顺序遍历**。

## 为什么这样设计

- patch 完成后 DOM 顺序已稳定——直接基于真实 DOM 顺序填数组，避免 reconcile 时还要再做一次排序。
- 数组里 push 而不是赋索引：`existing.push(refValue)` 让重复的 refValue 不会重复入数组（`!existing.includes(refValue)`）。

## 与 `useTemplateRef`（3.5+）的对比

3.5 起引入的 `useTemplateRef('elRefs')` 返回一个 `shallowRef<HTMLElement[] | null>`，**也**遵循同一收集逻辑（`useTemplateRef.ts:14-24` 通过 `Object.defineProperty` 给 `refs[key]` 装上 getter/setter 桥接）。也就是说 v-for + useTemplateRef 同样得到 patch 后的 DOM 顺序数组。

```ts
import { useTemplateRef } from 'vue'
const elRefs = useTemplateRef<HTMLElement[]>('elRefs')
```

类型签名上 3.5+ 把 v-for ref 数组类型推断做得更精准：`useTemplateRef<HTMLElement[]>('elRefs')` 不再需要 cast。

## 实战场景

1. **拖拽排序**：拿到 DOM 顺序数组后，可以遍历对比 transform 位置做"幽灵占位"。
2. **错位入场动画**：对每个元素根据 `index` 与 DOM 顺序差异决定动画 delay。
3. **响应式焦点管理**：当数组顺序变化（filter / sort）后，可以用 ref 数组同步 focus。

## 常见踩坑

- **顺序不等于 v-for 数据源顺序**：当 `v-for` 用了 `key` 且 DOM 被复用时，patch 顺序可能和数据顺序错位（例如使用 `<TransitionGroup>` 做 FLIP 动画）。
- **异步数据时数组为 `null`**：模板 ref 在 patch 后才赋值，`useTemplateRef('elRefs').value` 在 SSR 或第一次 mount 前的同步代码里读会是 `null`。
- **DOM 元素重复**：同样 DOM 在 v-for 中重复出现（不应该但有可能），`!existing.includes(refValue)` 会跳过重复——只保留第一个。
- **`useTemplateRef` 返回值类型**：传入 `'elRefs'` 字符串参数；**不要**直接传 ref 对象（那是 3.5 之前的写法，3.5+ 已废弃）。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · 模板 Ref](https://cn.vuejs.org/guide/essentials/template-refs.html) | ref 基础 |
| [Vue 官方 · useTemplateRef](https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref) | 3.5+ API |
| [Vue 源码 · rendererTemplateRef.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/rendererTemplateRef.ts) | setRef / 数组收集 |
| [Vue 源码 · useTemplateRef.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helpers/useTemplateRef.ts) | shallowRef 桥接 |

<!-- description.md -->
