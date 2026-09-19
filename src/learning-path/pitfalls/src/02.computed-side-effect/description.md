> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: computed 副作用

# computed 副作用：getter 内修改 ref 死循环

## 你会学到什么

- 在 `computed` 的 getter 内修改其它 ref 会形成自激循环
- Vue 检测到循环后抛出 / 栈溢出
- 修正：把副作用搬到 `watch` 或事件处理器

## 错误示例

```js
const a = ref(0)
const b = computed(() => {
  if (a.value < 10) a.value++  // ← 修改了依赖项 a
  return a.value * 2
})
```

## 修复版本

```js
const a = ref(0)
const b = computed(() => a.value * 2)
function bump() {
  if (a.value < 10) a.value++
}
```

## 动手试

1. 点击「错误版本：触发 computed」 — 触发栈溢出或调度告警
2. 点击「修复版本：事件里 bump」 — 正常
3. 看错误日志

## 根因

`computed` 在 getter 读 `a.value` 时收集依赖；getter 内又写 `a.value`，触发依赖重算，再读再写——递归触发调度，触发上限后栈溢出。

## 修复 / 选型

- 派生只读，绝不在 getter 内修改其他状态
- 写操作放事件 / `watch`
- 需要「lazy 累加」用普通函数，不混入 computed

## 延伸阅读

- [Computed — 副作用警告](https://vuejs.org/guide/essentials/computed.html#avoid-mutating-computed-value)

## 小结

1. **现象**：computed getter 内改其他 ref 死循环。
2. **复现**：错误版本触发栈溢出。
3. **修复**：把副作用搬到 watch / 事件。
