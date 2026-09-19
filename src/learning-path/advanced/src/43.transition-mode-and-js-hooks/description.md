# Transition 完整 API：mode / appear / duration / JS 钩子

> 版本：Vue 3.x | 状态：stable | 源码：`packages/runtime-core/src/components/BaseTransition.ts` | 延伸阅读：[Vue 官方：Transition](https://cn.vuejs.org/guide/built-ins/transition.html)

## 这是什么

`<Transition>` 围绕单个元素 / 组件的进入与离开添加动画。完整属性：

| 属性 | 类型 | 说明 |
|---|---|---|
| `name` | string | 自动生成 `<name>-enter-from` 等类名；缺省 `v-` |
| `appear` | boolean | 首次挂载是否也播放 |
| `mode` | `'in-out'` / `'out-in'` | 多元素过渡时的先后顺序 |
| `duration` | number / `{ enter, leave }` | 显式指定动画时长（避免 CSS 与 JS 钩子时序错位） |
| `type` | `'transition'` / `'animation'` | 监听哪种事件决定结束 |
| `enter-from-class` 等 6 个 prop | string | 自定义类名 |

JS 钩子共 8 个：`@before-enter / @enter / @after-enter / @enter-cancelled / @before-leave / @leave / @after-leave / @leave-cancelled`。

## 源码走读

```ts
// packages/runtime-core/src/components/BaseTransition.ts
// 在 mount/update/unmount 阶段调用 transition hooks
// 通过 runtimeTransitionContext 串联 beforeEnter → enter → afterEnter
```

## 实战场景

1. 路由切换动画（与 `<RouterView>` 结合）；
2. 弹窗 fade-in/out；
3. 集成 GSAP / Velocity.js 等 JS 动画库；
4. `mode="out-in"` 避免新旧元素重叠。

## 常见踩坑

- JS 钩子 `enter(el, done)` / `leave(el, done)` 必须**手动调用 `done()`**，否则 Vue 不知道动画何时结束；
- 同时存在 CSS transition 与 JS 钩子时，需用 `duration` 或 `type` 显式声明；
- `@enter-cancelled` / `@leave-cancelled` 仅在 `v-show` 触发的过渡中生效（v-if 直接移除节点）。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方：Transition](https://cn.vuejs.org/guide/built-ins/transition.html) | 类名约定、JS 钩子 |
| [Vue 官方：transition prop](https://cn.vuejs.org/api/built-ins.html#transition) | 完整 prop 列表 |
| [Vue 源码：BaseTransition.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/BaseTransition.ts) | 钩子串联 |