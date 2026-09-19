> 版本: Vue 3.x | 源码: packages/runtime-core/src/hydration.ts | 难度: 中等

# 13 · SSR hydration mismatch 警告与恢复策略

## 原理是什么

SSR 输出的 HTML 称为"客户端期望 DOM"。hydration 阶段遍历服务端生成的 HTML，匹配客户端 render 的 VNode，把事件、响应式绑定挂上去。当客户端渲染结果与 SSR HTML 不一致（文本不同、属性缺失、节点数量差异），Vue 会触发 `Hydration node mismatch` 警告并执行"恢复策略"——丢弃 SSR DOM，按客户端 VNode 重新 mount。

错误通过 `app.config.warnHandler` 收集。开发模式下：
- **文本不一致**：替换 SSR 文本节点；
- **属性/标签不一致**：回退到客户端 mount；
- **元素数量不一致**：丢弃剩余 SSR 节点，强制 mount。

## 一步步走读源码

源码定位：

- `packages/runtime-core/src/hydration.ts` 第 250-340 行：`hydrate` 主体。
- 同文件第 580-660 行：`propMismatchHandler` 属性差异。
- `packages/runtime-core/src/hydrationStrategies.ts`（自定义策略扩展点）。

关键片段：

```ts
// hydration.ts
function hydrateNode(node, vnode, parentComponent, ...) {
  if (nodeType === DOMNodeTypes.TEXT) {
    if (vnode.type === TextSymbol) {
      if ((node as Text).data !== vnode.children as string) {
        warn(`Hydration text mismatch in`, ...)
        // 恢复策略：直接替换文本
        ;(node as Text).data = vnode.children as string
      }
    }
  }
  // 元素不一致时，整段丢弃重新 mount
  if (!isMismatchAllowed) {
    warn(`Hydration node mismatch`, ...)
    // 客户端强制 mount 整个 subtree
    next = clientRender(node, vnode, ...)
  }
}
```

## 为何这样设计

- **本地化恢复**：常见差异只是文本/属性变化，仅替换该节点，不影响兄弟子树。
- **整段回退**：结构差异（元素增删）继续走客户端 mount，避免错位。
- **warn 收集**：通过 `app.config.warnHandler` 上报，dev 工具可以聚合统计。

## 与 `<KeepAlive>` 嵌套的边界

KeepAlive 缓存的子树是 client-side VNode，hydration 时只能命中初始 render；如果 SSR 期间 KeepAlive 缓存命中过，hydration 路径会因 DOM 节点类型不匹配触发 mismatch。常见规避：在 SSR 渲染期间关闭 KeepAlive，或确保缓存键在客户端首次 mount 时也能命中。

## Vue 官方延伸阅读

- 官方文档 SSR: <https://cn.vuejs.org/guide/scaling-up/ssr.html>
- 官方文档 hydration: <https://cn.vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/hydration.ts>

## 对应 RFC

无单独 RFC，作为 SSR 子模块存在。

## 延伸：可手写极简版本验证

demo `13.hydration-mismatch/App/App.vue` 模拟 SSR HTML + 客户端 VNode 的对比，把 mismatch 类型分类、恢复策略以可视化方式呈现。

## 参考资料

- 《Vue.js 设计与实现》霍春阳，第 19 章「同构渲染」
- 《Vue 技术揭秘》ssr 篇 <https://ustbhuangyi.github.io/vue-analysis/ssr/>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/hydration.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：computed 的 dirty 标记与缓存策略](_analysis/vue-source-insights.md#computed的dirty标记与缓存策略) | `packages/reactivity/src/computed.ts:97-122` 引用
- [Vue 源码洞察：Suspense 异步边界与 fallback 触发时机](_analysis/vue-source-insights.md#suspense异步边界与-fallback-触发时机) | `packages/runtime-core/src/components/Suspense.ts:191-220` 引用
