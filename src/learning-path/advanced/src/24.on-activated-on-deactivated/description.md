# onActivated / onDeactivated 在 KeepAlive 子树中的生命周期 {#on-activated-on-deactivated}

> **版本**：Vue 3.0+ | **状态**：stable | **源码**：`packages/runtime-core/src/components/KeepAlive.ts:1-180` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/composition-api-lifecycle.html#onactivated) | [RFC 42](https://github.com/vuejs/rfcs/discussions/129)

`onActivated` 与 `onDeactivated` 是 KeepAlive 给被缓存组件「额外送」的两个生命周期：

- **mounted / activated**：组件首次挂载触发 `onMounted`；再次进入 KeepAlive（被复用）时只触发 `onActivated`，不会再 mount。
- **unmounted / deactivated**：组件从 KeepAlive 中切走时只触发 `onDeactivated`（缓存仍存在）；真正被 KeepAlive 丢弃（max LRU 淘汰）时才触发 `onUnmounted`。

实战价值：

1. **动态列表 / 分页缓存**：列表滚动切走再回来，保留滚动位置、表单已填值。
2. **轮询 / 订阅类副作用**：组件隐藏时停掉定时器、隐藏时取消 WebSocket，回到前台再恢复 —— 避免空跑消耗。
3. **第三方 DOM 库生命周期**：图表、视频播放器在 deactivated 时销毁、activated 时重建。

## 这是什么 {#what}

```vue
<template>
  <KeepAlive>
    <ListView v-if="show" />
  </KeepAlive>
</template>

<script setup>
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  console.log('组件从缓存中恢复显示')
})
onDeactivated(() => {
  console.log('组件被 KeepAlive 切走（仍缓存）')
})
</script>
```

## 源码走读 {#source}

```ts
// packages/runtime-core/src/components/KeepAlive.ts (节选)
const activated = (vnode: VNode, container, anchor) => {
  const instance = vnode.component!
  if (instance.isDeactivated) {
    queuePostFlushCb(() => {
      instance.isDeactivated = false
      instance.bu      // beforeUpdate 钩子调用
      instance.hook('activated')   // 触发 onActivated
    })
  }
}

const deactivated = (vnode, container, anchor) => {
  const instance = vnode.component!
  if (!instance.isDeactivated) {
    queuePostFlushCb(() => {
      instance.isDeactivated = true
      instance.hook('deactivated')  // 触发 onDeactivated
    })
  }
}
```

关键事实：

- `onActivated` 在 DOM 更新**后**被 queuePostFlushCb 推入队列；拿到的是已挂载的真实 DOM。
- `onDeactivated` 同样在 post flush 时机 —— 它不会在「if 切换的同步阶段」触发。
- KeepAlive 通过「设置 instance.isDeactivated + 保留 vnode.domNode」实现「节点复用 + 子树缓存」。
- `max` 选项触发 LRU 淘汰时，被丢弃的组件会真的 `unmount` 一次 —— 此时 `onDeactivated` 也会触发，紧接着 `onUnmounted`。

## 实战场景 {#production}

1. **轮询组件**：后台激活时启动 setInterval，deactivated 时清理。
2. **滚动位置缓存**：KeepAlive 复用意味着 DOM 在；用 sessionStorage 持久化 scrollTop 在 activated 时恢复。
3. **图表库生命周期**：`<Echarts :option="..."/>` 在 deactivated 调 `chart.dispose()`，activated 重新 `init`。
4. **WebSocket 重连**：deactivated 时 `socket.close()`，activated 时重连 —— 避免后台一直收消息。

## 常见踩坑 {#pitfalls}

- **首次挂载只触发 onMounted**：组件从未「deactivate 过」，第一次 mounted 时 `onActivated` 不会触发 —— 别假设它一定会跑。
- **真实卸载时**：`onDeactivated` 仍然触发，紧接着 `onUnmounted`。在 `onDeactivated` 里释放监听器、在 `onUnmounted` 里再次检查是否真要释放 —— 后者通常用 `_destroyed` 标志位守卫。
- **`include` / `exclude` 命中才生效**：组件名不匹配 KeepAlive 规则时直接走 unmount，不会进 deactivated 状态。
- **`max` LRU 触发兜底**：业务不应该依赖「KeepAlive 永远留住所有实例」；重要数据请外提到 store。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/composition-api-lifecycle.html#onactivated) | API 文档 |
| [RFC 42](https://github.com/vuejs/rfcs/discussions/129) | KeepAlive 设计讨论 |
| [Vue 源码 · KeepAlive.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/KeepAlive.ts) | 完整实现 |
| [Vue 源码洞察：KeepAlive LRU 与激活态](_analysis/vue-source-insights.md#keepalive-xxx) | 隐式经验 |