# Vue 3 $listeners 移除与 $attrs 合并

## 核心变化

Vue 3 移除了 `$listeners` 对象，将其合并到 `$attrs` 中。

| Vue 2 | Vue 3 |
|--------|-------|
| `$attrs` 仅包含非 props 属性 | `$attrs` 包含**所有**属性 + 事件监听器 |
| `$listeners` 包含所有事件监听器 | ❌ 已移除 |

## 代码对比

### Vue 2

```vue
<!-- Parent.vue -->
<ChildComponent 
  :name="'Alice'" 
  :age="25" 
  @click="handleClick" 
  @focus="handleFocus" 
/>
```

```vue
<!-- Child.vue -->
<script>
export default {
  created() {
    // $attrs: { name: 'Alice', age: 25 }
    // $listeners: { click: handleClick, focus: handleFocus }
    console.log(this.$attrs);    // { name: 'Alice', age: 25 }
    console.log(this.$listeners); // { click: handleClick, focus: handleFocus }
    
    // 需要手动将 listeners 传递给子组件
    this.$emit('click', ...); // 转发事件
  }
}
</script>
```

### Vue 3

```vue
<!-- Parent.vue -->
<ChildComponent 
  :name="'Alice'" 
  :age="25" 
  @click="handleClick" 
  @focus="handleFocus" 
/>
```

```vue
<!-- Child.vue -->
<script setup>
import { useAttrs } from 'vue';

const attrs = useAttrs();
// attrs: { name: 'Alice', age: 25, onClick: handleClick, onFocus: handleFocus }
// 注意：事件监听器以 onXxx 形式存在
console.log(attrs);
</script>
```

## $attrs 在 Vue 3 中的结构

```js
{
  // 普通属性
  id: 'my-input',
  class: 'custom-class',
  placeholder: 'Enter text',
  
  // 事件监听器（以 on 前缀开头）
  onClick: handler,
  onFocus: focusHandler,
  onBlur: blurHandler,
  onInput: inputHandler,
  
  // v-model 绑定（.lazy, .trim 等修饰符）
  'onUpdate:modelValue': value => {},
  modelValue: 'initial'
}
```

## 继承行为对比

### Vue 2 的 inheritAttrs

```vue
<template>
  <!-- 需要手动绑定 $attrs -->
  <GrandChild v-bind="$attrs" v-on="$listeners" />
</template>
```

### Vue 3 的 inheritAttrs

```vue
<template>
  <!-- 直接使用 v-bind="$attrs" 即可 -->
  <!-- 所有属性和事件监听器都会传递 -->
  <GrandChild v-bind="$attrs" />
</template>

<script setup>
defineOptions({
  inheritAttrs: false // 禁用自动继承，手动控制
});
</script>
```

## 禁用 inheritAttrs 示例

当不希望根元素继承所有属性时：

```vue
<template>
  <!-- 根元素不会自动获得 $attrs 的属性 -->
  <div class="wrapper">
    <input v-bind="$attrs" />
  </div>
</template>

<script setup>
defineOptions({
  inheritAttrs: false
});
</script>
```

### 等效写法对比

| Vue 2 | Vue 3 |
|-------|-------|
| `v-bind="$attrs"` | `v-bind="$attrs"` |
| `v-on="$listeners"` | ❌ 不需要，已合并 |
| `inheritAttrs: false` | `inheritAttrs: false` |
| `$listeners.click` | `$attrs.onClick` |

## 在 Non-<script setup> 组件中使用

```vue
<script>
import { useAttrs } from 'vue';

export default {
  setup() {
    const attrs = useAttrs();
    
    return { attrs };
  },
  mounted() {
    // this.$attrs 仍然可用
    console.log(this.$attrs);
  }
}
</script>
```

## 常见问题

### Q: 如何在 Vue 3 中判断一个属性是普通属性还是事件？

```js
function isEventListener(key) {
  return key.startsWith('on');
}

Object.entries($attrs).forEach(([key, value]) => {
  if (isEventListener(key)) {
    console.log(`事件: ${key.slice(2)}`, value);
  } else {
    console.log(`属性: ${key}`, value);
  }
});
```

### Q: 如何只传递事件而不传递属性？

```vue
<script setup>
import { useAttrs, toHandlers } from 'vue';

const attrs = useAttrs();
const handlers = toHandlers(attrs);

// handlers 只包含事件监听器
</script>

<template>
  <GrandChild v-bind="attrs" v-on="handlers" />
</template>
```

### Q: 如何排除特定属性/事件？

```js
// 方式1: 解构
const { class: className, style, ...rest } = useAttrs();

// 方式2: 手动过滤
const filteredAttrs = Object.fromEntries(
  Object.entries(useAttrs())
    .filter(([key]) => !['class', 'style'].includes(key))
);
```

## 总结

| 变化点 | 说明 |
|--------|------|
| $listeners 移除 | 事件监听器合并到 $attrs |
| $attrs 结构变化 | 现在包含 `onXxx` 格式的事件监听器 |
| 传递方式简化 | `v-bind="$attrs"` 同时传递属性和事件 |
| inheritAttrs | 行为保持不变 |

## 参考资料

- [Vue 3 Migration Guide - $attrs including $listeners](https://v3-migration.vuejs.org/zh-cn/breaking-changes/attrs-includes-listeners.html)
- [Vue RFC - $attrs 改进](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0021-attrs-includes-class-style.md)
