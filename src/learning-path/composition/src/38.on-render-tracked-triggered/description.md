# onRenderTracked / onRenderTriggered 调试追踪

> 版本：Vue 3.x | 状态：stable | 源码：`packages/runtime-core/src/renderer.ts` | 延伸阅读：[Vue 官方：渲染函数](https://cn.vuejs.org/guide/extras/render-function.html)

## 这是什么

`onRenderTracked` 在组件渲染过程中**依赖收集阶段**触发；`onRenderTriggered` 在**触发更新阶段**触发。两个钩子仅在 dev 模式生效，用于追踪「谁读取/修改了哪个响应式属性」。

回调签名 `(event: DebuggerEvent)`，`DebuggerEvent` 包含：

- `effect`：当前 reactiveEffect 实例
- `target`：被追踪的目标（原始对象 / 数组 / map）
- `type`：`get` / `set` / `add` / `delete` / `clear` / `has` / `iterate`
- `key`：被访问/修改的属性名
- `newValue` / `oldValue`：新增于 Trigger 阶段

## 源码走读

```ts
// packages/runtime-core/src/renderer.ts
function setupRenderEffect(...) {
  const componentUpdateFn = () => {
    if (__DEV__) {
      instance.devRenderTracer = createDevEffect(instance, true)
      instance.devRenderTriggered = createDevEffect(instance, false)
      // 在 effect 上挂回调
    }
    // ...
  }
}
```

```ts
// packages/reactivity/src/effect.ts (DEV)
function createDevEffect(instance, tracked) {
  return (event) => {
    // 调用 instance.onRenderTracked / onRenderTriggered 回调
  }
}
```

## 实战场景

1. 调试「我的组件为什么渲染了 N 次」——通过 onRenderTracked 看到是哪个 ref / 哪个属性被访问；
2. 调试「为什么我改了 X 但视图没更新」——onRenderTriggered 追踪修改路径；
3. 编写 DevTools 扩展、自定义响应式可视化工具。

## 常见踩坑

- 仅 dev 模式可用：生产构建中**会被完全剥离**，不要依赖其行为；
- 钩子回调内**不应修改**响应式数据，否则会再次触发 onRenderTriggered 死循环；
- 收集与触发阶段都会逐个属性触发，调试日志输出请记得 `console.group` 或节流。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方：onRenderTracked](https://cn.vuejs.org/api/composition-api-lifecycle.html#onrendertracked) | API 签名 |
| [Vue 官方：onRenderTriggered](https://cn.vuejs.org/api/composition-api-lifecycle.html#onrendertriggered) | API 签名 |
| [Vue 源码：renderer.ts createDevEffect](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts) | dev 钩子实现 |