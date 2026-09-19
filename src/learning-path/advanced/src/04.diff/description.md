> 版本: Vue 3.x | RFC: — | 状态: 内部 API | 概念: Vue 内部 diff 算法

 

## 迁移指引 {#migration}

`diff` 属于 Vue 运行时核心内部实现（`packages/runtime-core/src/renderer.ts`），不开放公共 API。
如果你需要对比虚拟 DOM 变化，应改用：

- `patchProp` / `patchEvent` 自定义渲染器（`createRenderer`）
- 编译器优化标记 `BlockTree` + `PatchFlags`
- 服务端用 `renderToString` 拿到 VNode

公开 API 层面：使用 `useSSRContext()`、`<Suspense>` 等取代手动 diff。
