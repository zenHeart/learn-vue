> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: 不可变数据 vs 响应式

# 响应式 vs 不可变数据

## 你会学到什么

- `ref(Object.freeze({...}))` 持有冻结对象：写入报错，读取无需 trap
- `structuredClone` 深拷贝 + `shallowRef`：整体替换语义
- 何时选不可变（来自 Redux / Immer 工作流）

## 真实场景（抽象）

一个 1000 字段的对象。三种策略的写入耗时：
- ① `reactive`：每个字段都走 set trap
- ② `shallowRef` + 整体替换：只 set 一次 `.value`
- ③ `ref(Object.freeze(...))`：写入直接抛错（演示用）

## 动手试

1. 点击「reactive 改 1000 字段」 — 看耗时
2. 点击「shallowRef 整体替换」 — 明显更快
3. 点击「尝试写 freeze 对象」 — 控制台报 TypeError

## 根因

- `reactive` 在 set trap 里要做依赖通知 + 校验
- `shallowRef` 只在 `.value` 赋值时触发，整体对象引用替换
- `Object.freeze` 切断 Proxy 的可写 trap，写入直接 throw

## 修复 / 选型

- 数据从外部 store（Redux、Immer、SWR）流入 → `shallowRef`
- 整对象不可变 + 一次性替换 → `ref(freeze(...))` 或 `shallowRef`
- 字段级频繁更新 → `reactive`

## 延伸阅读

- [Immutability in Vue](https://vuejs.org/guide/best-practices/performance.html#avoid-reactive-objects-when-raw-seems-sufficient)

## 小结

1. **现象**：reactive 大对象写入慢。
2. **复现**：三种策略基准对比。
3. **修复**：不可变 + 整体替换用 shallowRef。
