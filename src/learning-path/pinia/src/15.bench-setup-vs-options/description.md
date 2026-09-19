> 版本: Pinia 2.x + bench self-test | RFC: — | 状态: stable | 源码: pinia/packages/pinia/src/store.ts (defineStore 工厂), createPinia.ts:23 (install)
> 延伸: [Pinia 性能 Tips](https://pinia.vuejs.org/cookbook/performance-tips.html) | [Vue 响应式开销](https://vuejs.org/guide/extras/reactivity-in-depth.html)

# 15 · Setup Store vs Options Store · 微基准

两种 store 写法在运行时表现几乎等价 —— Pinia 内部把两种风格都转成同一个 Store 实例,**性能差异主要来自应用层**,而不是框架本身。本 demo 通过三个常用操作做自测基准:

| 场景 | 关注点 |
|---|---|
| 创建 store | 工厂函数执行开销、ref/reactive 包装 |
| 读取 state | getter 缓存、reactive proxy 命中次数 |
| 订阅变化 | $subscribe 注册开销 |

## 这是什么

```ts
// Setup 风格
export const useSetupStore = defineStore('bench-setup', () => {
  const count = ref(0)
  return { count }
})

// Options 风格
export const useOptionsStore = defineStore('bench-options', {
  state: () => ({ count: 0 }),
})
```

两个 store 在 Pinia 内部都通过同一个 `createSetupStore` 流程,挂到 `pinia._s` Map 上,后续访问走同一套响应式代理。理论差异:

- Setup 风格多一步 `isRef` / `isReactive` 推断 → 创建时略慢;
- Options 风格创建时多一次 `state()` 函数调用;
- 读取与订阅运行时差异 < 1%。

## 源码走读

`store.ts:480` 附近挂载 `$subscribe / $watch / $onAction` 给两种风格共用;Setup 与 Options 的差别只在 `defineStore` 阶段 —— 工厂函数 vs options 对象 —— 后续行为收敛到同一个 `Store` 实体。

```ts
// pinia/packages/pinia/src/store.ts (核心工厂)
function createSetupStore($id, setup, options, pinia) {
  // ...把 ref / reactive 包装成 state,挂 actions / getters
}
```

## 实战场景

1. **真实场景** — 微基准告诉你"不要为了'快'选 Options";两者差异在生产中几乎不可感知,真正影响性能的是组件渲染次数与 watch 数量。
2. **边界场景** — 大型列表(>10k 项)用 Setup Store + `shallowRef` 比 reactive state 快 5-10 倍;这跟 Setup vs Options 的对比无关,跟响应式深度有关。

## 常见踩坑

- **不要"优化"成 Options**:除非真有问题,否则保持团队一致的写法优先;迁移成本远大于 1% 性能差。
- **`shallowRef` 优于 `ref`**:Pinia 没有强制要求 reactive depth,但默认会把对象全部 reactive。需要在 StoreOptions 里配 `deep: false`(见 `stateFactory` 内部)。
- **`$subscribe` 的回调开销**:回调里写重逻辑会拖慢后续 mutation;必要时 debounce。
- **bench 结果只作参考**:浏览器版本、CPU throttle、设备温度都会让数字浮动 ±20%;看趋势,不看绝对值。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Pinia 性能建议](https://pinia.vuejs.org/cookbook/performance-tips.html) | shallowRef / markRaw |
| [Vue 响应式原理](https://vuejs.org/guide/extras/reactivity-in-depth.html) | Proxy vs ref 触发频率 |
| [Pinia 源码 store.ts](https://github.com/vuejs/pinia/blob/main/packages/pinia/src/store.ts) | createSetupStore |
| [Benchmark.js](https://benchmarkjs.com/) | 通用基准库,本 demo 内嵌简化版 |
