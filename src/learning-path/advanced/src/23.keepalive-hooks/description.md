# onActivated / onDeactivated：KeepAlive 缓存生命周期 {#keepalive-hooks}

> 版本: Vue 3.0+ | RFC: 0042-keepalive | 状态: stable

`<KeepAlive>` 包裹的动态组件被切走时**不会触发 `onUnmounted`**——它会被缓存到内存中，下次切回时复用。Vue 为此引入了一对专用生命周期：

- **`onActivated(cb)`** — 组件被激活（首次挂载 + 后续从缓存恢复）时调用。
- **`onDeactivated(cb)`** — 组件被切走（缓存起来）时调用。

## 与 onMounted 的关系 {#mount-vs-activate}

| 阶段 | onMounted | onActivated |
| --- | --- | --- |
| 首次进入 KeepAlive | ✓ | ✓ |
| 从缓存恢复 | ✗（不重新挂载） | ✓ |
| 切走 | ✗（不卸载） | ✗（但 onDeactivated ✓） |
| 缓存被剔除（如 max=2 切到第三个） | ✗（之前已 mounted） | 真正走 onUnmounted |

## 实战场景 {#production}

- **恢复滚动位置**：deactivated 时记录 `scrollTop`，activated 时还原。
- **暂停后台轮询**：deactivated 时 `clearInterval`，activated 时重启（避免 hidden tab 浪费）。
- **数据刷新策略**：deactivated 时取消未完成的请求，activated 时重新拉取。
- **视频/音频组件**：deactivated 时 `pause()`，activated 时 `play()`。

## 关键陷阱 {#pitfalls}

1. **首次挂载也会触发 `onActivated`**：它和 `onMounted` 都会跑，不要重复做同一件事。
2. **`include` / `exclude` 改变后**：被剔除的组件触发完整 unmount 流程；新增的组件首次进入触发完整 mounted + activated。
3. **`max` LRU 淘汰**：被挤出的组件走 unmounted 流程，**不**走 deactivated。
4. **同一组件被多处 KeepAlive 包裹**：钩子会按外层 KeepAlive 触发顺序各触发一次。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · KeepAlive](https://vuejs.org/api/built-in-components.html#keepalive)
- [Vue 官方文档 · onActivated](https://vuejs.org/api/composition-api-lifecycle.html#onactivated)
- [Vue 官方文档 · onDeactivated](https://vuejs.org/api/composition-api-lifecycle.html#ondeactivated)
- [Vue 3 源码 · KeepAlive 渲染器](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/KeepAlive.ts)
- [RFC 0042 KeepAlive](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0042-keepalive.md)

<!-- description.md -->
