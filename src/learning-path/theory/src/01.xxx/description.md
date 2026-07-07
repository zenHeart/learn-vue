# Vue 理论基础: 虚拟 DOM {#vue-virtual-dom}

欢迎来到 Vue 理论基础学习路径的第一步！

在这一节中，我们将探索 Vue 的核心概念之一：虚拟 DOM (Virtual DOM)。

## 什么是虚拟 DOM？ {#what-is-virtual-dom}

虚拟 DOM 是真实 DOM 的内存表示，是一个轻量级的 JavaScript 对象，由 Vue 组件树建立起来。当状态发生变化时，Vue 生成新的虚拟 DOM 并与旧的虚拟 DOM 进行比较，计算出需要应用到真实 DOM 的最小变更，从而提高渲染性能。

## 为什么需要虚拟 DOM？ {#why-virtual-dom}

直接操作 DOM 是非常昂贵的。通过使用虚拟 DOM，Vue 可以：

1. 将 DOM 操作批量化，减少浏览器重绘和重排
2. 在内存中比较差异，而不是直接操作 DOM
3. 保持高效的跨平台能力

## 动手尝试 {#try-it-yourself}

右侧是一个简单的虚拟 DOM 实现示例。尝试修改 `createVNode` 函数，添加更多属性或子节点，并观察生成的虚拟 DOM 结构。
