# v-on 鼠标与键盘修饰符 {#v-on-key-mouse-modifiers}

> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/compiler-core/src/transforms/vOn.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/guide/essentials/event-handling.html#key-modifiers)

v-on 支持两类事件过滤器：

- **鼠标键修饰符**：`.left` / `.right` / `.middle` —— 限制事件只在指定鼠标键按下时触发。
- **键盘修饰符**：`.enter` / `.tab` / `.esc` / `.space` / `.up` / `.down` / `.left` / `.right` 等键名，以及 `.ctrl` / `.shift` / `.alt` / `.meta` 等修饰键。

修饰键可以**链式组合**：`@keydown.ctrl.shift.a` 表示「按住 Ctrl + Shift 的同时按下 A 键」。

## 这是什么 {#what}

```vue
<!-- 鼠标键 -->
<button @click.left="onLeftClick">左键</button>
<button @click.right.prevent="onRightClick">右键 + 阻止默认菜单</button>

<!-- 键盘单键 -->
<input @keydown.enter="submit" />
<input @keyup.esc="cancel" />

<!-- 修饰键 + 字母组合 -->
<input @keydown.ctrl.s.prevent="onSave" />
<input @keydown.ctrl.shift.a="onAction" />

<!-- 任意修饰键版本（精确匹配需要 .exact） -->
<button @click.ctrl="onCtrlClick">按住 Ctrl</button>
```

## 源码走读 {#source}

```ts
// packages/compiler-core/src/transforms/vOn.ts
// 编译后：
// 1) 键名修饰符：_withKeys(handler, ['enter', 'ctrl'])
// 2) 系统修饰键：_withModifiers(handler, ['ctrl'])

// packages/runtime-dom/src/modules/events.ts
const keyNames = {
  esc: 'Escape', tab: 'Tab', space: ' ',
  enter: 'Enter', up: 'ArrowUp', down: 'ArrowDown',
  left: 'ArrowLeft', right: 'ArrowRight',
  // ...
}
function withKeys(fn, modifiers) {
  return (event) => {
    if (!shouldFireEvent(event, modifiers)) return
    return fn(event)
  }
}
```

关键事实：

- **`keyCode` 已被废弃**：Vue 3 不再支持 `keyCode` 数字（13 / 27 等），统一走 `event.key` 字符串匹配。
- **可绑定任意键名**：`.page-down`、`.f1`、`.数字`（如 `.1`）—— Vue 用 kebab-case 转为 `event.key` 匹配。
- **修饰键 + 字母的组合**：`@keydown.ctrl.s` 内部会检查 `event.ctrlKey && event.key === 's'`，匹配规则按组合修饰符数组顺序检查。
- **`.exact` 配合修饰键**：仅当指定修饰键按下、其它修饰键未按下时触发；详见上一节「事件修饰符」。

## 实战场景 {#production}

1. **表单提交快捷键**：`<input @keydown.enter="submit">` 替代 `@submit.prevent`。
2. **退出键**：弹窗 `@keyup.esc="close"` 一键关闭。
3. **Ctrl+S 保存**：`@keydown.ctrl.s.prevent="save"` 同时阻止浏览器默认的"保存网页"。
4. **方向键导航**：列表 `@keydown.up="prev"` / `@keydown.down="next"` 上下移动焦点。
5. **自定义上下文菜单**：`.right.prevent` 阻止系统右键菜单，弹出自定义菜单。

## 常见踩坑 {#pitfalls}

- **`keyCode` 已废弃**：写 `@keydown.13` Vue 3 会警告，必须用 `.enter` 等键名。
- **修饰键 + 字母在 IME 输入下无效**：中文/日文输入法激活时，`event.key` 是 IME 内部值而非按键；需在 `compositionstart/end` 时手动屏蔽快捷键。
- **大写字母**：`.a` 同时匹配 `a` 和 `A`；`event.key` 返回实际按键值，`event.code` 才是物理位置。如果要严格匹配物理位置应自己判断 `event.code`。
- **`tab` 不可 preventDefault**：浏览器保留 Tab 焦点切换的能力，Vue 不阻止但会触发警告。
- **`.exact` 与键名修饰符关系**：`.exact` 只控制修饰键精度（是否独占），与键名（`.enter`）独立 —— `@keydown.ctrl.exact.enter` 表示"仅 Ctrl+Enter"。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/guide/essentials/event-handling.html#key-modifiers) | 键盘修饰符章节 |
| [Vue 官方](https://vuejs.org/guide/essentials/event-handling.html#mouse-button-modifiers) | 鼠标修饰符章节 |
| [Vue 源码 · vOn.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vOn.ts) | 编译期键名提取 |
| [MDN · KeyboardEvent.key](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/key) | key 值规范 |
| [MDN · KeyboardEvent.code](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/code) | code 物理位置规范 |
