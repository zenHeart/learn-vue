> 版本: Vue 3.5+ | RFC: — | 状态: stable | 概念: watch flush

# watch 的 flush 选项

watch 的第三个参数 options 支持 `flush: 'pre' | 'post' | 'sync'`，控制回调何时执行。

## 你会学到什么

- `'pre'`：组件更新前触发（默认）。
- `'post'`：组件更新后触发，可以访问最新 DOM。
- `'sync'`：同步触发，回调立即执行。

## 动手试

1. 切换 flush 选项并修改 value，观察回调时机。
2. 在回调里读 input.value 看是否最新。

## 关键陷阱

- sync 模式会绕过调度队列，需要谨慎使用。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 - watch flush](https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing) | flush 说明 |