> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/renderer.ts` | **延伸阅读**：[Vue 官方 · Custom Renderer](https://vuejs.org/api/custom-renderer.html) | [Vue 官方 · Hydration](https://vuejs.org/guide/scaling-up/ssr.html#hydration)

# createRenderer · 自定义渲染器

## 这是什么

`createRenderer` 把 Vue 渲染器的所有 DOM 操作（`createElement` / `insert` / `patchProp` / `remove` …）抽象成 9 个可注入的方法，宿主侧只需要补齐这套"操作节点"API，就能把 Vue 应用跑在任何环境里。

| API | 用途 |
| --- | --- |
| `createElement(type)` | 创建一个宿主节点 |
| `createText(text)` | 创建文本节点 |
| `setText(node, text)` | 修改文本节点 |
| `insert(child, parent, anchor?)` | 把节点插入父容器 |
| `remove(child)` | 移除节点 |
| `patchProp(node, key, prevVal, nextVal)` | 更新属性 / 事件 / class |
| `querySelector(selector)` | 查询宿主选择器 |
| `setScopeId(node, id)` | scoped CSS id 注入 |
| `cloneNode(node)` | 克隆节点（用于 v-once 等） |

运行时传入这套 options 后，返回 `{ render, createApp, hydrate }` 三个函数，与 `vue` 默认导出行为一致。这就是 runtime-core 与 runtime-dom 的分层依据——前者不知道任何 DOM 概念，后者提供浏览器环境的 9 个方法。

### createHydrationRenderer

`createHydrationRenderer` 比 `createRenderer` 多一个 `hydrate` 入口，用于 SSR 场景的客户端激活。两者共用一套 `nodeOps` 与 `patchProp`，所以可以基于同一份 nodeOps 编写跨 SSR / CSR 的渲染器。

## 源码走读

`packages/runtime-core/src/renderer.ts`：

- `L113-154` `RendererOptions<HostNode, HostElement>` 接口定义所有 9 个方法（含可选 hydrate 版本）
- `L318-323` `createRenderer<HostNode, HostElement>(options)` 签名
- `L328-332` `createHydrationRenderer(options)` 签名
- `L335-344` 两个 baseCreateRenderer 重载的分离

runtime-dom 的实现位于 `packages/runtime-dom/src/nodeOps.ts` 和 `packages/runtime-dom/src/patchProp.ts`，它们把 9 个方法映射到浏览器原生 DOM API。第三方渲染器（vue-three-fiber、vue-konva、vue-canvas）都遵循这一契约。

## 实战场景

1. **Canvas / WebGL 渲染**：vue-konva 把 `<template>` 里的 vnode 转译成 Konva.Shape，渲染器只负责把 vnode tree 投影到 canvas 命令队列。
2. **3D 场景**：vue-three-fiber 用 `THREE.Object3D` 作为 `HostElement`，把 `<group>`、`<mesh>` 编译成 Three.js 场景图节点。
3. **测试 / 内存渲染**：jsdom-style 的 stub renderer 只校验 vnode tree 形状，不真正操作 DOM——单测里跑组件必备。
4. **跨端一致 API**：Tauri / Electron 主进程复用业务组件，但渲染目标换成自己的虚拟 DOM 树。

## 常见踩坑

- **事件订阅**：浏览器默认 `addEventListener` 在 patchProp 里实现；如果宿主不是 DOM（比如 Canvas），事件要走自己的桥接层。
- **setScopeId / cloneNode 必须有**：很多 SFC 编译器产物会调用到，否则 scoped style 失效、v-once 报错。
- **Hydration 警告**：服务端 HTML 与客户端渲染结果不一致时，createHydrationRenderer 会发 warning；写自定义渲染器时必须保证 SSR 输出稳定。
- **memory renderer 缺 emit 链路**：测试场景常用 stub render 不会真的触发 emit，断言时只能比较 vnode tree 而不能依赖 watch 回调。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · Custom Renderer](https://vuejs.org/api/custom-renderer.html) | 接口规范与示例 |
| [Vue 官方 · SSR 指南](https://vuejs.org/guide/scaling-up/ssr.html) | hydrate 流程 |
| [Vue 源码 · renderer.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts#L318) | createRenderer 实现 |
| [Vue 源码 · nodeOps.ts](https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/nodeOps.ts) | 浏览器侧 nodeOps |
| [vue-three-fiber](https://github.com/pmndrs/vue-three-fiber) | Three.js 渲染器实现 |
| [vue-konva](https://github.com/konva-js/vue-konva) | Canvas 渲染器实现 |