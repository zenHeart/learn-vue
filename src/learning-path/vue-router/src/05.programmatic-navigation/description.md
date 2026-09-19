> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: 编程式导航

# 05 · 编程式导航

`useRouter()` 返回的实例提供 `push / replace / go / back / forward`，以及 `currentRoute`、`resolve()` 等元方法。

要点：

- `push` 会把目标压栈，**会留下历史记录**；`replace` 不会；
- 两种调用都返回 `Promise<NavigationFailure | undefined>`，需要在 `await` 后用 `NavigationFailureType` 判断是否成功；
- `back()` 等价于 `go(-1)`，但 `go` 接收任意整数；
- `resolve(rawLocation)` 用于在不真正跳转的情况下解析目标 URL，常用于埋点/分享卡片生成。

本 demo 模拟一个"工具栏"按钮区，分别尝试 `push`、故意失败的 `push`（命名错误），以及 `replace`/`back`。