# Vue Composition API setup 中获取组件实例

## 核心问题

在 Vue 3 Composition API 的 `setup()` 函数中，如何访问当前组件实例？主要有两种方式：

1. `setup()` 的第二个参数 `context`
2. `getCurrentInstance()` API

## 方式一：setup() 第二个参数 context

### context 包含的属性

```javascript
setup(props, context) {
  // context.attrs - 组件外部传入的非 prop 属性（相当于 Vue 2 的 $attrs）
  // context.slots - 组件外部传入的插槽（相当于 Vue 2 的 $slots）
  // context.emit - 触发事件的函数（相当于 Vue 2 的 $emit）
  // context.root - 访问根组件实例（相当于 Vue 2 的 $root）
  // context.parent - 访问父组件实例（相当于 Vue 2 的 $parent）
  // context.props - 响应式的 props（只读）
  // context.expose - 暴露公共属性（用于模板 ref 访问）
}
```

### 使用示例

```javascript
import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'ContextDemo',
  props: {
    title: String
  },
  emits: ['update', 'delete'],
  setup(props, context) {
    // 1. 访问 props
    console.log('props:', props.title);

    // 2. 触发事件
    const handleClick = () => {
      context.emit('update', 'new value');
    };

    // 3. 访问插槽
    context.slots.default?.();

    // 4. 访问父组件（谨慎使用）
    console.log('parent:', context.parent);

    // 5. 访问根组件
    console.log('root:', context.root);

    return { handleClick };
  }
});
```

### context.root 与 Vue 2 $root/$parent 对比

| Vue 2 | Vue 3 Composition API | 说明 |
|-------|----------------------|------|
| `this.$root` | `context.root` | 根组件实例 |
| `this.$parent` | `context.parent` | 父组件实例 |
| `this.$refs` | `defineExpose` + `ref` | 模板 ref |
| `this.$attrs` | `context.attrs` | 非 prop 属性 |
| `this.$listeners` | 已合并到 `context.attrs` | 事件监听器 |
| `this.$slots` | `context.slots` | 插槽 |

## 方式二：getCurrentInstance()

### 基本用法

`getCurrentInstance()` 返回当前组件的实例对象，仅在 `setup()` 或生命周期钩子中可用。

```javascript
import { defineComponent, getCurrentInstance } from 'vue';

export default defineComponent({
  name: 'InstanceDemo',
  setup() {
    // 获取当前组件实例
    const instance = getCurrentInstance();
    console.log('current instance:', instance);

    // instance 包含：
    // - instance.uid: 组件唯一 ID
    // - instance.type: 组件选项对象
    // - instance.parent: 父组件实例
    // - instance.root: 根组件实例
    // - instance.proxy: 组件的公开代理对象
    // - instance.emit: emit 函数
    // - instance.attrs / instance.slots / instance.props

    return {};
  }
});
```

### instance.proxy 详解

`instance.proxy` 是一个代理对象，允许通过 `this` 风格的语法访问组件属性：

```javascript
setup() {
  const instance = getCurrentInstance();

  // 访问 data
  instance.proxy.count;  // 相当于 this.count

  // 访问 methods
  instance.proxy.handleClick();  // 相当于 this.handleClick()

  // 访问 computed
  instance.proxy.doubleCount;  // 相当于 this.doubleCount

  // 访问 props
  instance.proxy.title;  // 相当于 props.title（只读）
}
```

### 注意事项

> **警告**：`getCurrentInstance()` 只能在 `setup()` 或生命周期钩子中调用，在 `setup()` 外部使用会返回 `null`。

```javascript
// ❌ 错误：在 setup 外部调用
const instance = getCurrentInstance();
setup() {
  // ...
}

// ✅ 正确：在 setup 内部调用
setup() {
  const instance = getCurrentInstance();
  // ...
}
```

## 在 Composable 中使用

### 问题背景

在 Vue 3 的 Composable 函数中，无法直接访问 `this`，需要通过参数传递或 `getCurrentInstance()` 获取组件实例。

### 方案一：通过参数传入实例

```javascript
// useWindowResize.js
export function useWindowResize(onResize) {
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
  };
}

// 组件中使用
setup() {
  const handleResize = () => {
    console.log('window resized');
  };

  useWindowResize(handleResize);
}
```

### 方案二：使用 getCurrentInstance()

```javascript
// useParentInfo.js
import { getCurrentInstance } from 'vue';

export function useParentInfo() {
  const instance = getCurrentInstance();

  if (!instance) {
    console.warn('useParentInfo must be used within setup()');
    return null;
  }

  return {
    parent: instance.parent,
    root: instance.root,
    uid: instance.uid
  };
}

// 组件中使用
setup() {
  const { parent, root, uid } = useParentInfo();
  console.log('parent:', parent);
  console.log('root:', root);
}
```

### 方案三：通过 context 参数传递

```javascript
// useEmit.js
export function useEmit(context) {
  return {
    emit: context.emit
  };
}

// 父组件
setup(props, context) {
  const { emit } = useEmit(context);

  return {
    emit
  };
}
```

## 父子组件通信实战

### 获取父组件实例

```javascript
setup(props, context) {
  // 获取直接父组件
  const parent = context.parent;

  // 调用父组件方法（谨慎使用）
  const handleParentMethod = () => {
    context.parent?.someMethod();
  };

  return { handleParentMethod };
}
```

### 获取根组件实例

```javascript
setup(props, context) {
  // 获取根组件
  const root = context.root;

  // 访问根组件状态（谨慎使用）
  const isDarkMode = () => {
    return context.root.theme === 'dark';
  };

  return { isDarkMode };
}
```

### 在 defineExpose 中暴露方法

```javascript
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ExposeDemo',
  setup() {
    const count = ref(0);
    const increment = () => count.value++;

    // 使用 defineExpose 暴露公共属性
    // 这样父组件通过 ref 引用时才能访问
    defineExpose({
      count,
      increment
    });
  }
});
```

父组件使用：

```vue
<template>
  <ChildComponent ref="childRef" />
  <button @click="childRef.increment()">调用子组件方法</button>
  <div>count: {{ childRef.count }}</div>
</template>

<script setup>
import { ref } from 'vue';
import ChildComponent from './ChildComponent.vue';

const childRef = ref(null);
</script>
```

## 最佳实践

1. **优先使用 props + emits**：父子通信使用 props 和 emits 更清晰、可追踪
2. **避免直接访问 parent/root**：这会增加组件耦合度
3. **使用 provide/inject**：跨层级通信使用 provide/inject 更优雅
4. **使用 defineExpose**：明确控制哪些属性可被外部访问
5. **Composable 封装逻辑**：将逻辑封装在 Composable 中，通过参数传递需要的值

## 常见问题

### Q: setup() 中可以用 this 吗？

**答**：不可以。Composition API 的 `setup()` 函数不在组件实例上下文中执行，没有 `this`。需要使用 `context` 或 `getCurrentInstance()` 获取组件相关属性。

### Q: getCurrentInstance() 返回 null 怎么办？

**答**：`getCurrentInstance()` 只在组件的 `setup()` 或生命周期钩子中可用。在 `setup()` 外部（如普通函数、异步回调）中调用会返回 `null`。

### Q: Vue 3 中如何替代 Vue 2 的 $refs？

**答**：
1. 模板 ref：`const myRef = ref(null)` 在 `<component ref="myRef">` 中使用
2. `defineExpose()`：在子组件中暴露需要被访问的属性/方法
3. `getCurrentInstance().proxy`：通过实例代理访问

### Q: 如何在 setup 中访问 router/store？

**答**：
```javascript
import { useRouter, useStore } from 'vue-router'; // vue-router 4
import { useStore } from 'vuex'; // vuex 4
import { inject } from 'vue'; // Pinia 或 provide/inject

setup() {
  const router = useRouter();
  const store = useStore();
  // 或者通过 inject
  const myService = inject('myService');
}
```

## 总结

| 方式 | 适用场景 | 注意事项 |
|------|----------|----------|
| `context.root` | 访问根组件 | 慎用，增加耦合 |
| `context.parent` | 访问父组件 | 慎用，破坏封装 |
| `getCurrentInstance()` | 获取当前实例 | 仅在 setup 内可用 |
| `defineExpose()` | 暴露组件属性 | 配合模板 ref 使用 |
| provide/inject | 跨层级通信 | 推荐使用 |
