> 版本: Pinia 2.x | RFC: — | 状态: stable | 概念: 跨 store 引用与组合

# 07 · 跨 store 调用

一个 store 的 action 中调用另一个 store 是合法且常见的：

- 在 action / getter 内部调用 `useOtherStore()` 获取实例；
- 便于把跨域逻辑（购物车结账需要清库存、提交订单需要扣积分）整合到一个动作里。

陷阱：

- **循环依赖**：`useCart()` 中调用 `useUser()`，`useUser()` 又调用 `useCart()` 会无限递归；
- 解决：抽出"协调层" store，让两个原 store 只与协调 store 通信；或在 action 内用 `setTimeout` / 事件总线异步解耦；
- 模块化：把 store 按业务域划分（user / cart / inventory），跨域放在 `composables/` 中组合。