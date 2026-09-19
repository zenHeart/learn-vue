# computed 缓存、依赖变化与副作用

> 演示运行版本：Vue 3.5.13。源码阅读固定到同名 tag；内部字段不是公共 API。

先预测再点击：连续读取两次时是否得到同一个对象？修改 count 后再读取呢？getter 返回一个新对象，因此对象身份可以观测缓存复用，不需要在 getter 内修改计数器。

1. 点击“连续读取两次”：身份相同，值为 2。
2. 点击“修改依赖后读取”：身份不同，新值为 4；再连续读取又会复用新对象。
3. b、c 组成派生链。模板读取它们也会驱动求值，因此不要把“用户没有点击读取按钮”理解成“没有消费者读取”。
4. echo 的副作用由同步 watch 执行。实际工程通常用默认调度，同步 watcher 不会批处理，避免用于高频变动。

源码从 `ComputedRefImpl.value` 跟入 `refreshComputed`：它结合 dirty 标记、全局版本及依赖版本判断是否需要重算，不能简化成每次依赖通知都必然执行 getter。对照 [computed.ts](https://github.com/vuejs/core/blob/v3.5.13/packages/reactivity/src/computed.ts) 和 [effect.ts](https://github.com/vuejs/core/blob/v3.5.13/packages/reactivity/src/effect.ts)。

getter 应保持纯计算。写其他 ref 不等于给只读 computed 自身赋值，不保证出现 readonly 警告；错误同步可能引入循环和不可预测的读取行为。参见 [官方计算属性约定](https://vuejs.org/guide/essentials/computed.html#best-practices)。

迁移挑战：把派生值改成价格与数量计算的订单总额，证明无关状态改变不会生成新对象；说明为什么 getter 中不能发送网络请求。
