> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-dom/src/components/Transition.ts:300-319`、`packages/runtime-core/src/components/BaseTransition.ts` | **延伸阅读**：[Vue 官方 · Transition](https://cn.vuejs.org/guide/built-ins/transition.html)

# `<Transition :duration>`：数字与对象

## 这是什么

`<Transition>` 的 `:duration` prop 控制动画时长，避免 CSS `transition-duration` 在复杂路径（JS 钩子 + CSS 同时存在）下导致"提前结束"问题：

- **数字**：`<Transition :duration="1000">` → enter 和 leave 都用 1000ms
- **对象**：`<Transition :duration="{ enter: 500, leave: 800 }">` → 分别指定
- **字符串**：`"500ms"` / `"0.5s"` 也被 toNumber 接受（dev 模式下断言是 number）

源码 `Transition.ts:300-311`：

```ts
function normalizeDuration(duration) {
  if (duration == null) return null
  else if (isObject(duration)) {
    return [NumberOf(duration.enter), NumberOf(duration.leave)]
  } else {
    const n = NumberOf(duration)
    return [n, n]      // 单一数字：enter / leave 同值
  }
}
```

## 触发顺序

`<Transition>` 的 CSS class 名 hook 触发顺序（每个阶段都跑 enter + leave 的对称钩子）：

```
首次 mount：
  before-enter → enter → (transition end) → after-enter
非首次（update）：
  before-leave（旧节点） → leave（旧节点） → (transition end) → after-leave
  before-enter（新节点）→ enter（新节点）→ (transition end) → after-enter
```

`duration` 在这里的作用是告诉 Vue **不要等到浏览器 transitionend 事件**——使用 setTimeout(timeout) 兜底，避免 transitionend 不触发导致动画卡死。

## 实战场景

1. **复杂动画**：keyframes 比 transition 难判断结束，使用 duration 强制结束。
2. **第三方动画库**（GSAP / anime.js）：CSS class hook 之外再接 JS 钩子。
3. **路由过渡**：进 / 出时长不同的"覆盖式"动画（500/800）。

## 常见踩坑

- **省略 duration**：浏览器 transitionend 不触发 → 永远 stuck。需要：CSS transition 时间合法 / 不要 `display:none` 切 / 写 `transition: all`。
- **单位字符串**：Vue 内部 `toNumber('500ms')` → NaN，dev 模式 `assertNumber` 会警告；只接受纯数字或 `Number` 类型的数字字符串。
- **`mode="out-in"` + duration**：先 leave 完才 enter，总时长是两者之和——别忘了 CSS 也要匹配。
- **JS 钩子与 CSS 同时**：JS hook 内部 `done()` 主动结束，CSS 不必等；JS hook 签名 `done => { setTimeout(done, 500) }`。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · Transition](https://cn.vuejs.org/guide/built-ins/transition.html) | CSS class hook 列表 |
| [Vue 官方 · Transition 钩子](https://cn.vuejs.org/guide/built-ins/transition.html#javascript-hooks) | JS 钩子签名 |
| [Vue 源码 · Transition.ts](https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/components/Transition.ts) | duration 解析 |
| [Vue 源码 · BaseTransition.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/BaseTransition.ts) | resolveTransitionHooks 钩子调度 |

<!-- description.md -->
