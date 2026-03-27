# v-model 在 Render 函数中的使用

## 核心概念

v-model 本质上是 **属性绑定 + 事件绑定** 的语法糖。在 template 中编译器自动转换，但在 render 函数中需要手动实现。

### Vue 3 中 v-model 的本质

```vue
<!-- template 中的 v-model -->
<input v-model="value" />

<!-- 编译器转换后的等价形式 -->
<input :modelValue="value" @update:modelValue="value = $event" />
```

### Render 函数中的等价实现

```js
import { h } from 'vue';

export default {
  render() {
    return h('input', {
      value: this.modelValue,
      onInput: (e) => this.$emit('update:modelValue', e.target.value)
    });
  }
};
```

## 基础用法

### 示例一：input 元素

```vue
<script>
import { h } from 'vue';

export default {
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    }
  },
  emits: ['update:modelValue'],
  render() {
    return h('input', {
      type: 'text',
      value: this.modelValue,
      onInput: (e) => this.$emit('update:modelValue', e.target.value)
    });
  }
};
</script>
```

### 示例二：textarea 元素

```js
render() {
  return h('textarea', {
    value: this.modelValue,
    onInput: (e) => this.$emit('update:modelValue', e.target.value)
  });
}
```

### 示例三：select 元素

```js
render() {
  return h('select', {
    value: this.modelValue,
    onChange: (e) => this.$emit('update:modelValue', e.target.value)
  }, [
    h('option', { value: 'a' }, 'Option A'),
    h('option', { value: 'b' }, 'Option B'),
    h('option', { value: 'c' }, 'Option C')
  ]);
}
```

## v-model 修饰符处理

### .lazy 修饰符

```js
render() {
  return h('input', {
    value: this.modelValue,
    // 使用 onChange 替代 onInput，即 lazy 模式
    onChange: (e) => this.$emit('update:modelValue', e.target.value)
  });
}
```

### .trim 修饰符

```js
render() {
  return h('input', {
    value: this.modelValue,
    onInput: (e) => {
      const value = e.target.value.trim();
      this.$emit('update:modelValue', value);
    }
  });
}
```

### .number 修饰符

```js
render() {
  return h('input', {
    value: this.modelValue,
    onInput: (e) => {
      const parsed = parseFloat(e.target.value);
      this.$emit('update:modelValue', isNaN(parsed) ? e.target.value : parsed);
    }
  });
}
```

## 多个 v-model

### 示例：用户名 + 邮箱

```vue
<script>
import { h } from 'vue';

export default {
  props: {
    username: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  emits: ['update:username', 'update:email'],
  render() {
    return [
      h('input', {
        type: 'text',
        value: this.username,
        onInput: (e) => this.$emit('update:username', e.target.value),
        placeholder: 'Username'
      }),
      h('input', {
        type: 'email',
        value: this.email,
        onInput: (e) => this.$emit('update:email', e.target.value),
        placeholder: 'Email'
      })
    ];
  }
};
</script>
```

## 自定义 v-model 参数

### 示例：v-model:title

```vue
<script>
import { h } from 'vue';

export default {
  props: {
    title: { type: String, default: '' }
  },
  emits: ['update:title'],
  render() {
    return h('input', {
      type: 'text',
      value: this.title,
      onInput: (e) => this.$emit('update:title', e.target.value)
    });
  }
};
</script>
```

```vue
<!-- 父组件使用 -->
<MyInput v-model:title="pageTitle" />
```

## 在 JSX 中的 v-model

### 使用插值

```jsx
// MyInput.jsx
export default {
  props: {
    modelValue: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  render() {
    return (
      <input
        value={this.modelValue}
        onInput={(e) => this.$emit('update:modelValue', e.target.value)}
      />
    );
  }
};
```

```jsx
// 父组件
<MyInput v-model={this.inputValue} />
```

### 多个 v-model

```jsx
render() {
  return (
    <div>
      <input
        value={this.username}
        onInput={(e) => this.$emit('update:username', e.target.value)}
      />
      <input
        value={this.email}
        onInput={(e) => this.$emit('update:email', e.target.value)}
      />
    </div>
  );
}
```

## v-model 与复选框/单选框

### 复选框

```js
render() {
  return h('input', {
    type: 'checkbox',
    checked: this.modelValue,
    onChange: (e) => this.$emit('update:modelValue', e.target.checked)
  });
}
```

### 单选框

```js
render() {
  return [
    h('input', { type: 'radio', value: 'a', checked: this.modelValue === 'a',
      onChange: () => this.$emit('update:modelValue', 'a') }),
    h('input', { type: 'radio', value: 'b', checked: this.modelValue === 'b',
      onChange: () => this.$emit('update:modelValue', 'b') })
  ];
}
```

## Vue 2 vs Vue 3 对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| v-model 属性 | `value` | `modelValue` |
| v-model 事件 | `input` | `update:modelValue` |
| 多个 v-model | `v-model` + `v-model:xxx` | 相同 |
| 修饰符 | `.lazy`, `.trim`, `.number` | `.lazy`, `.trim`, `.number` |
| render 函数 | `createElement` | `h` |

## Vue 2 示例（createElement）

```js
export default {
  props: {
    value: { type: String, default: '' }
  },
  emits: ['input'],
  render(createElement) {
    return createElement('input', {
      attrs: { type: 'text' },
      domProps: { value: this.value },
      on: {
        input: (e) => this.$emit('input', e.target.value)
      }
    });
  }
};
```

## 常见问题

### Q: 为什么 onInput 而不是 onChange？

`onInput` 在每次输入时触发，`onChange` 在失焦时触发。v-model 默认使用 `onInput`（即时更新），`.lazy` 修饰符才用 `onChange`。

### Q: 如何处理 v-model 的初始值？

```js
// 正确：从 props 读取初始值
props: {
  modelValue: { type: String, default: '' }
},
render() {
  return h('input', {
    value: this.modelValue, // 直接用 props 值
    onInput: (e) => this.$emit('update:modelValue', e.target.value)
  });
}
```

### Q: render 中如何访问父组件的 v-model 值？

通过 `this.modelValue`（props）访问。Vue 自动将 v-model 绑定转换为对应的 props。

## 总结

| 实现方式 | 说明 |
|---------|------|
| `h('input', { value: this.modelValue, onInput: ... })` | 基础 input |
| `h('input', { type: 'checkbox', checked: this.modelValue, ... })` | 复选框 |
| `h('input', { value: this.modelValue, onChange: ... })` | lazy 修饰符 |
| `this.$emit('update:modelValue', val)` | 更新值 |
| `props: { modelValue: ... }` + `emits: ['update:modelValue']` | 声明 |

## 参考资料

- [Vue 3 官方文档 - 自定义组件 v-model](https://vuejs.org/guide/components/v-model.html)
- [Vue 3 RFC - v-model 参数改进](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0021-attrs-includes-class-style.md)
- [Vue 3 迁移指南 - v-model](https://v3-migration.vuejs.org/zh-cn/breaking-changes/v-model.html)
