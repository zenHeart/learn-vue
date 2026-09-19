# v-model 修饰符：lazy / number / trim {#v-model-modifiers}

> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/compiler-core/src/transforms/vModel.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/guide/essentials/forms.html#modifiers)

v-model 修饰符控制「输入事件触发时机」与「值转换方式」：

| 修饰符 | 默认触发事件 | 修饰后 | 值处理 |
|---|---|---|---|
| 无 | `input` | — | 原值 |
| `.lazy` | `input` | `change`（失焦/Enter 才触发） | 原值 |
| `.number` | `input` | — | `parseFloat(v)` 或保持原值 |
| `.trim` | `input` | — | `v.trim()` |

修饰符可链式组合：`v-model.lazy.trim` 表示在 `change` 事件触发并去首尾空格。

## 这是什么 {#what}

```vue
<!-- 默认：每次输入触发 -->
<input v-model="text" />

<!-- .lazy：失焦或 Enter 后才更新 -->
<input v-model.lazy="text" />

<!-- .number：parseFloat 转换 -->
<input v-model.number="age" />

<!-- .trim：去掉首尾空格 -->
<input v-model.trim="username" />

<!-- 组合：lazy + trim -->
<input v-model.lazy.trim="search" />
```

## 源码走读 {#source}

```ts
// packages/compiler-core/src/transforms/vModel.ts
// 编译后：
// _withDirectives(el, [
//   [_vModelText, value, { trim: true, number: true }],
// ])

// packages/runtime-dom/src/directives/vModel.ts
const input = el
const assign = isLazy
  ? (v) => (input.value = v, modelValue = v)
  : (v) => ((input.value = v), updateModel((trim || number) ? castValue(v) : v))
```

关键事实：

- **`.lazy` 改变事件类型**：默认监听 `input`，加 `.lazy` 后改为 `change` —— 输入过程中 model 不变，仅失焦/Enter 时更新。
- **`.number` 不强制类型**：仅当 `parseFloat` 成功（即结果严格 NaN 不出现）才转 number，否则保留原字符串 —— 这意味着空输入仍是空字符串而非 0。
- **`.trim` 行为**：仅 trim 字符串两端，不去除中间空格；同时影响 input 元素 `.value` 的写入与 model 更新。
- **修饰符状态可被组件读取**：`defineModel('x', { modifiers: { trim: true } })` 让子组件按需消费修饰符语义（详见 `composition/29.v-model-deep-options`）。

## 实战场景 {#production}

1. **数字输入框**：`<input v-model.number="age" type="number">` 父组件拿到 number 而不是 string。
2. **搜索框减少触发**：`<input v-model.lazy="search">` 在 change 事件触发，避免每个按键都跑搜索请求（再配合 debounce 更好）。
3. **用户名 / 标签输入**：`.trim` 防止用户复制粘贴时携带空格。
4. **组合修饰符**：实时搜索用 `.lazy.trim` 配合 change 事件 + 防抖。

## 常见踩坑 {#pitfalls}

- **`.number` 不强制类型**：输入 `abc` 不会被强行转 0，model 仍是 `'abc'`。
- **`.trim` 不清理中间空格**：只去首尾，中间多个空格保留。
- **`.lazy` 阻断 IME**：输入法激活（中文/日文）时不会触发 change，需手动监听 `compositionend`。
- **type="number" 与 v-model**：浏览器会把数字字段的非数字输入清空；`v-model.number` 接受的是字符串。推荐用 `<input type="text" v-model.number>` 由 `.number` 决定是否转。
- **`v-model.lazy.number`**：两者组合时 `.number` 仍仅作用于 change 事件那次写入。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/guide/essentials/forms.html#modifiers) | v-model 修饰符 |
| [Vue 源码 · vModel.ts](https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/directives/vModel.ts) | 指令运行时实现 |
| [Vue 源码 · vModel compiler](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vModel.ts) | 编译期提取修饰符 |
| [MDN · input event](https://developer.mozilla.org/docs/Web/API/Element/input_event) | input 事件规范 |
| [MDN · change event](https://developer.mozilla.org/docs/Web/API/HTMLElement/change_event) | change 事件规范 |
