# Vue 事件修饰符详解

> 深入理解 Vue 事件修饰符的实现原理、内部机制，以及 `.capture`、`.native` 等修饰符的作用。

## 目录

- [事件传播机制](#事件传播机制)
- [Vue 事件修饰符一览](#vue-事件修饰符一览)
- [.capture 修饰符](#capture-修饰符)
- [.native 修饰符（Vue 2）](#native-修饰符-vue-2)
- [Vue 3 的变化](#vue-3-的变化)
- [常见问题与最佳实践](#常见问题与最佳实践)

---

## 事件传播机制

### DOM 事件传播三阶段

DOM 事件传播分为三个阶段：

```
┌─────────────────────────────────────────────────────────────┐
│                    事件传播三阶段                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. 捕获阶段 (Capture Phase)                               │
│      └── 事件从 Window → Document → HTML → Body → ... → Target │
│                                                             │
│   2. 目标阶段 (Target Phase)                                │
│      └── 事件到达目标元素本身                                 │
│                                                             │
│   3. 冒泡阶段 (Bubble Phase)                                │
│      └── 事件从 Target → ... → Body → HTML → Document → Window │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 事件监听器注册方式

```javascript
element.addEventListener('click', handler, useCapture);

// useCapture = true  → 捕获阶段触发
// useCapture = false → 冒泡阶段触发（默认）
```

---

## Vue 事件修饰符一览

Vue 提供了多种事件修饰符，用于控制事件行为：

| 修饰符 | 说明 | 实现方式 |
|--------|------|----------|
| `.stop` | 阻止事件冒泡 | `event.stopPropagation()` |
| `.prevent` | 阻止默认行为 | `event.preventDefault()` |
| `.capture` | 使用捕获模式 | `useCapture: true` |
| `.self` | 仅当事件目标是自身时触发 | 检查 `event.target` |
| `.once` | 事件只触发一次 | 触发后自动移除监听 |
| `.passive` | 承诺不调用 preventDefault | 提升滚动性能 |
| `.native` | 监听组件根元素的原生事件 | 仅 Vue 2 |

### 修饰符链式调用

```vue
<!-- 阻止冒泡 + 阻止默认行为 -->
<div @click.stop.prevent="handler">点击</div>

<!-- 捕获模式 + 只触发一次 -->
<div @click.capture.once="handler">点击</div>
```

---

## .capture 修饰符

### 作用

`.capture` 修饰符将事件监听器添加到事件捕获阶段，而不是默认的冒泡阶段。

### 代码示例

```vue
<div @click.capture="handleCapture">
  父元素（捕获阶段）
  <div @click="handleBubble">
    子元素（冒泡阶段）
  </div>
</div>
```

```javascript
const handleCapture = () => console.log('捕获阶段：父元素');
const handleBubble = () => console.log('冒泡阶段：子元素');
```

### 点击子元素时的执行顺序

```
未使用 .capture: 子元素 → 父元素
使用 .capture:  父元素 → 子元素
```

### 使用场景

1. **需要先处理父元素事件**：如统一事件处理、权限校验
2. **实现事件委托**：在父元素统一处理子元素事件
3. **调试事件流**：观察事件传播过程

---

## .native 修饰符（Vue 2）

### 作用

在 Vue 2 中，自定义组件默认不触发原生事件。`.native` 修饰符用于在组件根元素上监听原生事件。

### 代码示例

```vue
<!-- MyButton.vue -->
<template>
  <button @click="handleClick">
    <slot></slot>
  </button>
</template>

<!-- Parent.vue -->
<template>
  <!-- 使用 .native 监听组件根元素的原生 click -->
  <MyButton @click.native="handleNativeClick">
    点击我
  </MyButton>
</template>
```

### 工作原理

`.native` 的实现机制：

```javascript
// Vue 2 内部实现（简化）
{
  handler: function(event) {
    // 组件实例没有 $listeners['click'] 时
    // Vue 会尝试将事件传递给根元素的原生事件监听器
  }
}
```

### 注意事项

1. 仅在 Vue 2 中有效，Vue 3 已移除
2. 仅作用于组件根元素的原生事件
3. 如果组件内部已经通过 `$emit` 抛出了事件，不需要 `.native`

---

## Vue 3 的变化

### .native 被移除

Vue 3 移除了 `.native` 修饰符，原因：

1. **组件事件机制改变**：Vue 3 中，非 props 的 attributes（包括事件）默认会自动继承到组件根元素
2. **emits 选项**：Vue 3 推荐使用 `emits` 选项显式声明组件会抛出的事件

### Vue 3 中的替代方案

#### 方案一：使用 v-bind="$attrs"

```vue
<!-- MyButton.vue -->
<template>
  <button v-bind="$attrs">  <!-- 继承所有非 props 属性和事件 -->
    <slot></slot>
  </button>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
</script>
```

#### 方案二：使用 emits 选项

```vue
<!-- MyButton.vue -->
<script setup>
const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', 'payload')
}
</script>
```

#### 方案三：直接在组件上监听

```vue
<!-- Parent.vue -->
<template>
  <!-- Vue 3 中可以直接监听，不需要 .native -->
  <MyButton @click="handleClick">
    点击我
  </MyButton>
</template>
```

### Vue 3 新增修饰符

| 修饰符 | 说明 |
|--------|------|
| `.capture` | 同 Vue 2，捕获阶段触发 |
| `.once` | 同 Vue 2，只触发一次 |
| `.passive` | 同 Vue 2，提升滚动性能 |
| `.right` | 鼠标右键事件 |
| `.middle` | 鼠标中键事件 |

---

## 常见问题与最佳实践

### Q1: `.stop` 和 `.prevent` 的区别？

```vue
<!-- .stop：阻止事件继续传播（不触发父元素的点击事件） -->
<div @click="parentHandler">
  <button @click.stop="childHandler">点击</button>
</div>

<!-- .prevent：阻止元素的默认行为（如表单提交、链接跳转） -->
<form @submit.prevent="handleSubmit">
  <button type="submit">提交</button>
</form>
```

### Q2: `.self` 和 `.stop` 的区别？

```vue
<!-- .self：仅当 event.target 是当前元素时才触发 -->
<div @click.self="handler">
  <button>点击我（事件冒泡到父 div）</button>
</div>
<!-- 点击按钮时，父 div 的 handler 不会触发（因为 target 是 button） -->

<!-- .stop：阻止事件传播到父元素 -->
<div @click="parentHandler">
  <button @click.stop="childHandler">点击</button>
</div>
<!-- 点击按钮时，childHandler 触发，但 parentHandler 不会触发 -->
```

### Q3: 为什么 scroll 事件推荐使用 `.passive`？

```vue
<!-- 未使用 .passive -->
<div @scroll="handleScroll">
  内容...
</div>

<!-- 使用 .passive（提升滚动性能） -->
<div @scroll.passive="handleScroll">
  内容...
</div>
```

`.passive` 告诉浏览器事件处理器不会调用 `preventDefault()`，允许浏览器立即开始滚动而无需等待事件处理完成。

### Q4: 事件修饰符链式调用的顺序？

```vue
<!-- 修饰符从左到右依次执行 -->
<div @click.stop.prevent="handler">
  点击
</div>

<!-- 等价于 -->
<div @click="(e) => { e.stopPropagation(); e.preventDefault(); handler(); }">
  点击
</div>
```

### Q5: 如何在 Vue 3 中实现类似 `.native` 的效果？

```vue
<!-- MyComponent.vue -->
<template>
  <button class="my-button">
    <slot></slot>
  </button>
</template>

<script setup>
// 方式一：使用 $attrs 自动继承
// 模板中无需额外代码，$attrs 会自动传递到 button

// 方式二：显式使用 v-bind
defineOptions({ inheritAttrs: false })
</script>

<!-- Parent.vue -->
<template>
  <!-- 直接监听，Vue 3 会自动将事件传递到根元素 -->
  <MyComponent @click="handler" />
</template>
```

---

## 总结

| 修饰符 | 作用阶段 | 核心作用 |
|--------|----------|----------|
| `.capture` | 捕获阶段 | 父元素先于子元素处理事件 |
| `.stop` | 冒泡阶段 | 阻止事件继续传播 |
| `.prevent` | 任意阶段 | 阻止默认行为 |
| `.self` | 任意阶段 | 仅自身为目标时触发 |
| `.once` | 任意阶段 | 事件只触发一次 |
| `.passive` | 任意阶段 | 提升滚动性能 |
| `.native` | - | Vue 2 特有，监听根元素原生事件 |

### Vue 2 vs Vue 3 差异

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| `.native` | 支持 | 已移除 |
| 组件事件继承 | 需要 `.native` | 自动通过 `$attrs` |
| `inheritAttrs` | 默认 true | 可设置为 false |
| emits 选项 | 无 | 支持，推荐使用 |

---

## 参考资料

- [Vue 2 事件修饰符文档](https://v2.vuejs.org/v2/guide/events.html#Event-Modifiers)
- [Vue 3 事件处理文档](https://vuejs.org/guide/essentials/event-handling.html#event-modifiers)
- [Vue 3 自定义事件文档](https://vuejs.org/guide/components/events.html)
- [MDN 事件传播](https://developer.mozilla.org/en-US/docs/Web/API/Event/event_phase)
