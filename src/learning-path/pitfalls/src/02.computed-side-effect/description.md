# computed 副作用：让读取保持纯计算

> 版本：Vue 3.x。运行区只执行修复后的实现，反例用于代码分析。

getter 内写入依赖会使读取产生状态变化，但不保证出现 readonly 警告、递归错误或栈溢出。结果还取决于谁读取 computed、写入条件及调度时机，不能把固定延时后输出一条“循环”日志当作复现证据。

## 分析反例

```js
const a = ref(0)
const b = computed(() => {
  a.value++ // 读取 b 同时修改状态，违反纯计算约定
  return a.value * 2
})
```

先说明此读取的副作用，再把修改迁到事件处理器中。运行区的 `goodB` 只计算 `a * 2`；点击读取验证 a 不变，点击 bump 才修改 a。

## 迁移挑战

订单总额计算中混入“保存购物车”请求会有什么问题？将派生计算与保存操作分开，为连续两次读取不产生请求写一个测试。需要响应状态变化的副作用时使用 watch，并明确清理及调度要求。

依据：[Vue 官方计算属性最佳实践](https://vuejs.org/guide/essentials/computed.html#best-practices)。
