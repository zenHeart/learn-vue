> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: 响应式丢失

# 响应式丢失：解构 reactive 后失效

## 你会学到什么

- `const { count } = state` 拿到的 `count` 是普通 number，失去响应式
- `toRefs(state)` 把每个字段变成 ref，解构后仍响应
- `reactive` 内部是 Proxy，对原始值解构就断了追踪链

## 错误示例

```js
const state = reactive({ count: 0, name: 'A' })
const { count, name } = state  // count 是普通 number
function inc() { count++ }     // 不再触发更新
```

## 修复版本

```js
const state = reactive({ count: 0, name: 'A' })
const { count, name } = toRefs(state)  // 都是 ref
function inc() { count.value++ }
```

## 动手试

1. 点击「错误版本：解构 + 自增」 — UI 不更新
2. 点击「修复版本：toRefs + value++」 — UI 更新
3. 看控制台 / 状态显示

## 根因

`reactive(obj)` 返回 Proxy。`const { count } = proxy` 等价于「读一次 proxy.count 后赋值给新变量」，之后新变量与 proxy 无关。

## 修复 / 选型

- 需要解构：先 `toRefs`
- 需要传值给函数：传整个对象
- 简单场景直接用 `ref`

## 延伸阅读

- [Reactivity — toRefs](https://vuejs.org/api/reactivity-utilities.html#torefs)

## 小结

1. **现象**：改解构出来的值不生效。
2. **复现**：错误版本自增按钮失效。
3. **修复**：`toRefs` 把字段变 ref。
