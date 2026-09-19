> 版本: Vue 3.2+ | RFC: 0227-effect-scope | 状态: stable | 概念: watchEffect flush / once 选项

# watchEffect flush / once 完整选项

`watchEffect` 接受一个可选的第二参数对象，常用选项包括 `flush`、`once`、`onTrack`、`onTrigger`。

## 你会学到什么

- `flush: 'pre'`：组件更新前触发（默认）。
- `flush: 'post'`：组件更新后触发，可访问最新 DOM。
- `flush: 'sync'`：同步触发，回调在 setter 内立即执行。
- `once: true`：让 effect 只运行一次后自动停止。
- 调试钩子 `onTrack` / `onTrigger` 帮助定位依赖追踪行为。

## 动手试

1. 切换 flush 选项并点击 value++，观察触发顺序与 DOM 表现。
2. 勾选 once 复选框，多次点击 value++，确认只触发一次。

## 关键陷阱

- flush: 'sync' 会绕过调度队列，可能造成频繁渲染，需慎用。
- once 行为只对 watch/watchEffect 生效；watch 的 once 同样要求 source 至少变化一次才终止。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 - watchEffect](https://vuejs.org/api/reactivity-watchers.html#watcheffect) | API 与选项说明 |
| [Vue RFC 0227](https://github.com/vuejs/rfcs/discussions/228) | effect scope 提案 |