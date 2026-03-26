# Key Modifiers

> 🟡 medium | #Event Handling | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

监听键盘事件时，我们经常需要检查特定键。Vue 允许添加键修饰符。尝试完成以下挑战：

## 挑战代码

```vue
<template>
  <!-- Add key modifiers made this will fire even if Alt or Shift is also pressed -->
  <button @click="onClick1">A</button>

  <!-- Add key modifiers made this will only fire when Shift and no other keys are pressed -->
  <button @click="onCtrlClick">A</button>

  <!-- Add key modifiers made this will only fire when no system modifiers are pressed -->
  <button @click="onClick2">A</button>
</template>
```

## 答案

```vue
<template>
  <!-- 即使 Alt 或 Shift 也被按下也会触发 -->
  <button @click.alt="onClick1">A</button>

  <!-- 只有当 Shift 且无其他系统修饰键被按下时触发 -->
  <button @click.shift.exact="onCtrlClick">A</button>

  <!-- 只有当无系统修饰键（Alt/Shift/Ctrl/Meta）被按下时触发 -->
  <button @click.exact="onClick2">A</button>
</template>
```

## 解释

Vue 的键盘事件修饰符：
- `.alt` / `.shift` / `.ctrl` / `.meta` — 需要对应键被按下
- `.exact` — 精确匹配，限制只能由指定的修饰键组合触发，不允许其他系统修饰键
- `.enter` / `.tab` / `.delete` 等 — 特定键的别名

`@click.alt` 表示 Alt 键被按下时触发点击，无论是否有其他键。
`@click.alt.exact` 表示只有 Alt 被按下，没有其他修饰键。
