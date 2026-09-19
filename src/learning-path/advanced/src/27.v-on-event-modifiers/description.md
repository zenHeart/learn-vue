# v-on 事件修饰符：stop / prevent / capture / self / once / passive / exact {#v-on-event-modifiers}

> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/compiler-core/src/transforms/vOn.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/guide/essentials/event-handling.html#event-modifiers)

事件修饰符是「在模板里改写 DOM 事件行为」的便捷前缀。编译期把它们转写成 `withModifiers` / `withKeys` 包裹函数，运行时在事件分发链路上统一处理：

| 修饰符 | 等价手写 | 作用 |
|---|---|---|
| `.stop` | `event.stopPropagation()` | 阻止事件继续冒泡 |
| `.prevent` | `event.preventDefault()` | 阻止浏览器默认行为（如表单提交、链接跳转） |
| `.capture` | `addEventListener(..., { capture: true })` | 在捕获阶段触发，而非冒泡 |
| `.self` | 仅 `event.target === currentTarget` | 只在事件源是当前元素时触发 |
| `.once` | `{ once: true }` | 事件只触发一次后自动解绑 |
| `.passive` | `{ passive: true }` | 承诺不会 `preventDefault`，滚动性能更优 |
| `.exact` | 严格匹配修饰键组合 | 控制 `.ctrl` / `.shift` 等是否需要严格精确 |

## 这是什么 {#what}

```vue
<!-- 同时组合 stop + prevent -->
<form @submit.prevent.stop="onSubmit">...</form>

<!-- capture + once：捕获阶段触发，只触发一次 -->
<div @click.capture.once="onCapture">...</div>

<!-- self + prevent：仅当点击元素自身才阻止默认 -->
<a @click.self.prevent="...">链接</a>

<!-- passive：scroll 性能优化 -->
<ul @scroll.passive="onScroll">...</ul>

<!-- exact：精确修饰键 -->
<button @click.ctrl.exact="onCtrlOnly">仅 Ctrl+点击</button>
```

## 源码走读 {#source}

```ts
// packages/compiler-core/src/transforms/vOn.ts
// 编译后：
// _withModifiers(handler, ['stop', 'prevent'])

// packages/runtime-dom/src/modules/events.ts
function withModifiers(fn, modifiers) {
  return (event, ...args) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]]
      if (guard && guard(event, modifiers)) return
      // ... 处理 stop / prevent / self / ctrl 等
    }
    return fn(event, ...args)
  }
}
```

关键事实：

- 修饰符是**编译期宏**：编译时把所有 `.stop.prevent` 之类组合写入 `withModifiers(handler, [...])` 调用数组，运行时按顺序匹配处理。
- **执行顺序敏感**：`.stop.prevent` 与 `.prevent.stop` 行为不同（顺序对应事件对象的处理顺序）。
- **`.passive` 与 `.prevent` 互斥**：浏览器规范禁止 passive 监听器调用 preventDefault，Vue 在 console 给出警告。
- **`.once` 是一次性事件**，触发后会自动解绑；适合配合 `keydown` 等反复触发的事件做"只生效一次"逻辑。

## 实战场景 {#production}

1. **表单提交**：`<form @submit.prevent="onSubmit">` 替代手写 `e.preventDefault()`。
2. **嵌套卡片冒泡**：外层 `@click.stop="onCardClick"`，内层按钮正常触发 —— 阻止外层被点击。
3. **全局点击关闭弹窗**：window 上 `@click`，元素 `@click.self` 排除自身 —— 避免打开弹窗后立即被 window 监听关闭。
4. **长列表滚动**：监听 scroll 时用 `.passive`，避免主线程被 preventDefault 卡住（Chrome 也会给出警告）。
5. **一次性引导弹窗**：`.once` 触发后自动解绑，无需手动 `removeEventListener`。

## 常见踩坑 {#pitfalls}

- **顺序敏感**：`.stop.prevent` 先 stopPropagation 再 preventDefault；颠倒顺序语义会变。
- **`.passive` + `.prevent`**：浏览器禁止 passive 监听器调 preventDefault，Vue 会给出警告。
- **`.self` 不阻止子元素冒泡**：仅当 `event.target === currentTarget` 才触发；点击子元素时外层监听器依然会触发。
- **`.capture` 与冒泡冲突**：capture 监听器先于冒泡监听器触发；多个 capture 监听器按 DOM 树深度顺序触发。
- **`.exact` 是修饰键限制**：不传 `.exact` 时 `.ctrl` 仅要求"按住 Ctrl"，传 `.exact` 才要求"只按 Ctrl"。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/guide/essentials/event-handling.html#event-modifiers) | 事件修饰符章节 |
| [Vue 源码 · vOn.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vOn.ts) | 编译期修饰符提取 |
| [Vue 源码 · events.ts](https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/modules/events.ts) | withModifiers 运行时实现 |
| [MDN · Event.preventDefault](https://developer.mozilla.org/docs/Web/API/Event/preventDefault) | 原生 preventDefault 文档 |
| [MDN · passive listener](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#passive) | passive 选项浏览器规范 |
