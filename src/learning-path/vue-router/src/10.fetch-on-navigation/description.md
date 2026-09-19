> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: 导航时数据获取

# 10 · 导航前/导航后获取数据

两种模式：

- **导航后获取**：`onMounted` 中发起请求，配合加载骨架屏；
- **导航前获取**：`beforeRouteEnter` 中 `await fetch(...)`，完成后通过 `next(vm => vm.setData(...))` 写入组件实例。

Vue 3 + `<Suspense>` 提供了第三种更优雅的写法：**async setup + Suspense**——把数据请求放进组件入口的 await 中，外层用 `<Suspense>` 处理加载态。这也是 Vue 团队推荐的方式。

本 demo 三种写法都给到，可在右侧路由间切换对比体验。