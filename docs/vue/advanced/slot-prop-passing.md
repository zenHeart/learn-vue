# Vue 插槽属性传递完整指南

## 目录

1. [概述](#概述)
2. [默认插槽 vs 具名插槽](#默认插槽-vs-具名插槽)
3. [通过属性传递插槽（动态插槽）](#通过属性传递插槽动态插槽)
4. [函数式组件传递插槽](#函数式组件传递插槽)
5. [动态插槽名](#动态插槽名)
6. [render 函数中的插槽处理](#render-函数中的插槽处理)
7. [setup 返回 TSX 的插槽处理](#setup-返回-tsx-的插槽处理)
8. [常见问题和最佳实践](#常见问题和最佳实践)

---

## 概述

Vue 的插槽（Slot）是一种用于组件组合的核心机制，它允许父组件向子组件传递内容。在 Vue 中，插槽内容的传递本质上是通过属性（props/attrs）方式实现的。理解这一底层机制对于掌握 Vue 的组件化设计至关重要。

### 插槽的工作原理

当父组件向子组件传递插槽内容时：

```
父组件模板中的插槽内容
        ↓
    经过编译
        ↓
成为子组件实例上的 $slots 对象中的 VNode
        ↓
子组件通过 <slot> 元素渲染
```

插槽内容在父组件模板中经过编译后，成为 VNode（虚拟 DOM 节点），然后作为属性传递给子组件。子组件通过 `this.$slots` 或 `useSlots()` 访问这些 VNode，并通过 `<slot>` 元素将它们渲染到 DOM 中。

---

## 默认插槽 vs 具名插槽

### 默认插槽

默认插槽是最基础的插槽形式，父组件直接向子组件传递内容。

**子组件定义**：

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <div class="card-header">
      <h3>{{ title }}</h3>
    </div>
    <div class="card-body">
      <!-- 默认插槽 -->
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String
})
</script>
```

**父组件使用**：

```vue
<template>
  <Card title="欢迎">
    <p>这是卡片的内容区域</p>
    <p>多个元素也可以</p>
  </Card>
</template>
```

编译后，`<p>这是卡片的内容区域</p>` 和 `<p>多个元素也可以</p>` 会成为 `Card` 组件实例的 `$slots.default` 数组中的 VNode。

### 具名插槽

当需要向子组件的不同位置传递不同内容时，使用具名插槽。

**子组件定义**：

```vue
<!-- Layout.vue -->
<template>
  <div class="layout">
    <header class="header">
      <!-- 具名插槽 -->
      <slot name="header"></slot>
    </header>
    <main class="main">
      <!-- 默认插槽 -->
      <slot></slot>
    </main>
    <footer class="footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

**父组件使用**：

```vue
<template>
  <Layout>
    <template #header>
      <h1>网站标题</h1>
    </template>

    <p>这是主体内容</p>

    <template #footer>
      <p>版权所有 2024</p>
    </template>
  </Layout>
</template>
```

### v-slot 指令详解

`v-slot` 是 Vue 2.6+ 引入的插槽指令，用于指定插槽名称和接收插槽 prop。

**基本语法**：

```vue
<!-- 完整语法 -->
<template v-slot:slotName="slotProps">
  <div>插槽内容</div>
</template>

<!-- 简写语法 -->
<template #slotName="slotProps">
  <div>插槽内容</div>
</template>

<!-- 默认插槽简写 -->
<template #default="slotProps">
  <div>插槽内容</div>
</template>
```

---

## 通过属性传递插槽（动态插槽）

### v-bind 动态传递插槽

Vue 支持使用 `v-bind`（缩写 `:`）动态绑定插槽，这允许在运行时决定传递哪些插槽内容。

**使用场景**：根据条件或数据动态决定插槽内容。

```vue
<template>
  <div>
    <button @click="toggleSlot = !toggleSlot">切换插槽</button>

    <MyComponent>
      <!-- 动态切换插槽内容 -->
      <template #[currentSlot]>
        <p>当前插槽: {{ currentSlot }}</p>
      </template>
    </MyComponent>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const toggleSlot = ref(false)
const currentSlot = computed(() => toggleSlot.value ? 'header' : 'footer')
</script>
```

### $slots 的使用

在子组件内部，通过 `this.$slots`（选项式 API）或 `useSlots()`（组合式 API）访问插槽内容。

**选项式 API**：

```vue
<script>
export default {
  methods: {
    hasSlot(name) {
      return !!this.$slots[name]
    },
    renderSlot(name) {
      const slot = this.$slots[name]
      return slot ? slot() : null
    }
  }
}
</script>
```

**组合式 API**：

```vue
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()

// 检查插槽是否存在
console.log(slots.default)    // 默认插槽
console.log(slots.header)      // 具名插槽 header
console.log(slots.footer)     // 具名插槽 footer
</script>
```

---

## 函数式组件传递插槽

函数式组件是一种无状态、无实例的轻量级组件。在 Vue 3 中，函数式组件主要通过 `h()` 函数或直接返回 JSX 来定义。

### 使用 h() 函数构建虚拟 DOM 时传递插槽

函数式组件的 `h()` 用法与选项式组件类似，插槽内容通过 `slots` 属性传递。

```javascript
import { h } from 'vue'

// 基础函数式组件
const Icon = (props, { slots }) => {
  return h('svg', {
    class: 'icon',
    style: { width: props.size, height: props.size }
  }, slots.default?.())
}

// 使用
const App = {
  render() {
    return h(Icon, { size: '24px' }, {
      default: () => h('span', '🎉')
    })
  }
}
```

### 传递多个插槽的函数式组件

```javascript
import { h } from 'vue'

const Card = (props, { slots }) => {
  return h('div', { class: 'card' }, [
    h('div', { class: 'card-header' }, slots.header?.()),
    h('div', { class: 'card-body' }, slots.default?.()),
    h('div', { class: 'card-footer' }, slots.footer?.())
  ])
}

// 使用
const App = {
  render() {
    return h(Card, {}, {
      header: () => h('h2', '标题'),
      default: () => h('p', '内容'),
      footer: () => h('button', '确定')
    })
  }
}
```

---

## 动态插槽名

### v-for 遍历生成多个插槽

当需要根据数据动态生成多个插槽时，可以使用 `v-for` 结合动态插槽名。

**子组件**：

```vue
<!-- TableColumn.vue -->
<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">
          {{ col.title }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td v-for="col in columns" :key="col.key">
          <slot :name="col.key" :row="currentRow"></slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  columns: Array,
  currentRow: Object
})
</script>
```

**父组件**：

```vue
<template>
  <TableColumn :columns="columns" :current-row="row">
    <template v-for="col in columns" :key="col.key" #[col.key]="slotProps">
      <span :class="col.class">{{ slotProps.row[col.key] }}</span>
    </template>
  </TableColumn>
</template>
```

### #[slot.name] 动态插槽名语法

`#[slotName]` 是 `v-slot:[slotName]` 的简写形式，用于动态指定插槽名。

```vue
<template>
  <Container>
    <template #[dynamicName]>
      动态插槽内容
    </template>
  </Container>
</template>

<script setup>
import { ref } from 'vue'

const dynamicName = ref('header')
// 改变时会切换到 'content' 或 'footer' 插槽
</script>
```

### 完整示例：动态表单字段

```vue
<!-- DynamicForm.vue -->
<template>
  <form>
    <div v-for="field in fields" :key="field.name">
      <label>{{ field.label }}</label>

      <!-- 使用动态插槽名 -->
      <component :is="field.component" :value="field.value">
        <template #[field.name]="props">
          <input
            v-if="field.type === 'input'"
            v-bind="props"
            :value="field.value"
            @input="e => emit('update', field.name, e.target.value)"
          />
        </template>
      </component>
    </div>
  </form>
</template>

<script setup>
defineProps({
  fields: Array
})

const emit = defineEmits(['update'])
</script>
```

---

## render 函数中的插槽处理

在 Vue 的 render 函数中，插槽通过 `this.$slots` 访问，这是一个包含所有插槽 VNode 的对象。

### this.$slots 的使用

```javascript
const MyComponent = {
  render() {
    return this.$createElement('div', {
      class: 'container'
    }, [
      // 渲染具名插槽
      this.$slots.header,
      // 渲染默认插槽
      this.$slots.default,
      // 渲染带条件的插槽
      this.$slots.footer && this.$slots.footer()
    ])
  }
}
```

### 渲染函数返回插槽内容

在 render 函数中，插槽内容本身就是 VNode，可以直接返回或处理。

```javascript
const Wrapper = {
  props: {
    tag: {
      type: String,
      default: 'div'
    }
  },
  render() {
    const tag = this.tag
    return this.$createElement(tag, {
      class: 'wrapper'
    }, this.$slots.default?.())
  }
}
```

### 在 render 函数中处理作用域插槽

作用域插槽允许子组件向父组件传递数据，父组件根据这些数据决定渲染内容。

```javascript
const ScopedList = {
  props: {
    items: Array
  },
  render() {
    return this.$createElement('ul', {}, [
      ...this.items.map(item =>
        this.$createElement('li', {}, [
          this.$scopedSlots.default?.({ item })
        ])
      )
    ])
  }
}
```

**父组件使用**：

```javascript
const App = {
  render() {
    return this.$createElement(ScopedList, {
      props: { items: ['a', 'b', 'c'] }
    }, {
      default: (props) => this.$createElement('span', props.item)
    })
  }
}
```

---

## setup 返回 TSX 的插槽处理

在 Vue 3 + TSX 环境中，插槽的处理方式与 template 不同，需要使用特定的语法。

### useSlots() 组合式 API

在 setup 中，使用 `useSlots()` 获取插槽对象。

```tsx
import { defineComponent, useSlots, h } from 'vue'

const Card = defineComponent({
  props: {
    title: String
  },
  setup(props) {
    const slots = useSlots()

    return () => (
      <div class="card">
        <div class="card-header">
          <h3>{props.title}</h3>
        </div>
        <div class="card-body">
          {slots.default?.()}
        </div>
        <div class="card-footer">
          {slots.footer?.()}
        </div>
      </div>
    )
  }
})
```

### TSX 中传递插槽给子组件

在 TSX 中向子组件传递插槽时，使用 `v-slots` 指令或 `v-slots` prop。

```tsx
import { defineComponent, h } from 'vue'

const Parent = defineComponent({
  setup() {
    return () => (
      <Child
        v-slots={{
          header: () => <h2>标题</h2>,
          default: () => <p>默认内容</p>,
          footer: () => <button>确定</button>
        }}
      />
    )
  }
})
```

### 传递带 prop 的作用域插槽

TSX 中处理带 prop 的作用域插槽：

```tsx
const ListWrapper = defineComponent({
  props: {
    items: Array
  },
  setup(props, { slots }) {
    return () => (
      <ul>
        {props.items.map(item => (
          <li>
            {slots.default?.({ item })}
          </li>
        ))}
      </ul>
    )
  }
})

// 父组件使用
const App = defineComponent({
  setup() {
    const items = [{ name: 'Alice' }, { name: 'Bob' }]

    return () => (
      <ListWrapper items={items}>
        {{
          default: ({ item }) => <span>{item.name}</span>
        }}
      </ListWrapper>
    )
  }
})
```

### h() 函数配合 TSX

在 setup 中也可以使用 `h()` 函数替代 JSX：

```tsx
import { defineComponent, h, useSlots } from 'vue'

const Layout = defineComponent({
  setup() {
    const slots = useSlots()

    return () => h('div', { class: 'layout' }, [
      h('header', {}, slots.header?.()),
      h('main', {}, slots.default?.()),
      h('footer', {}, slots.footer?.())
    ])
  }
})
```

---

## 常见问题和最佳实践

### Q1: $slots 和 $scopedSlots 的区别？

在 Vue 2 中，`$slots` 用于默认插槽，`$scopedSlots` 用于作用域插槽。Vue 3 统一为 `$slots` 对象，通过函数形式同时支持普通插槽和作用域插槽。

```javascript
// Vue 2
this.$slots.default      // 普通插槽
this.$scopedSlots.item   // 作用域插槽

// Vue 3
this.$slots.default?.()          // 普通插槽
this.$slots.item?.({ item })      // 作用域插槽
```

### Q2: 为什么插槽内容会丢失？

常见原因：

1. **子组件未声明 `<slot>`**：确认子组件模板中包含 `<slot>` 元素
2. **使用了错误的插槽名**：检查 `v-slot:xxx` 和 `<slot name="xxx">` 是否匹配
3. **条件渲染导致插槽未创建**：确保父组件模板中的 `<template v-slot>` 在所有分支都有

```vue
<!-- 错误示例：条件可能导致插槽丢失 -->
<MyComponent>
  <template v-if="show">
    <template #header>标题</template>
  </template>
</MyComponent>

<!-- 正确示例 -->
<MyComponent>
  <template v-if="show" #header>
    标题
  </template>
</MyComponent>
```

### Q3: 如何在子组件中向插槽内容传递数据？

使用作用域插槽，向 `<slot>` 元素传递 prop：

```vue
<!-- 子组件 -->
<slot :user="currentUser" :isLoggedIn="!!currentUser"></slot>

<!-- 父组件接收 -->
<Child>
  <template #default="{ user, isLoggedIn }">
    <span v-if="isLoggedIn">{{ user.name }}</span>
    <span v-else>请登录</span>
  </template>
</Child>
```

### Q4: 动态组件如何传递插槽？

使用 `component` 的 `is` 属性动态切换组件时，插槽需要通过 `v-slots` 传递：

```vue
<template>
  <component :is="currentComponent" v-bind="componentProps">
    <template v-if="hasHeader" #header>
      <DefaultHeader />
    </template>
    <template #default>
      <DefaultContent />
    </template>
  </component>
</template>
```

### Q5: 插槽的渲染时机是什么时候？

插槽内容在父组件渲染时创建 VNode，然后在子组件渲染时通过 `<slot>` 元素渲染。这意味着：

- **父组件先于子组件渲染**（父组件的 setup 和模板渲染先执行）
- **插槽内容的响应式数据是父组件的**（数据来源取决于在哪里定义）
- **插槽内容的样式作用域是父组件的**（除非使用 `:slotted` 伪类）

### Q6: 多个插槽如何使用解构？

当需要解构插槽 prop 时，直接在 `v-slot` 指令中使用：

```vue
<!-- 正确：直接解构 -->
<MyList :items="items">
  <template #item="{ item, index }">
    <span>{{ index }}. {{ item.name }}</span>
  </template>
</MyList>

<!-- 错误：嵌套解构 -->
<MyList :items="items">
  <template #item="slotProps">
    <!-- 不要这样做 -->
    <span>{{ slotProps.item.name }}</span>
  </template>
</MyList>
```

### Q7: 如何让插槽内容访问父组件的 provide/inject？

插槽内容的上下文是父组件的，所以可以直接访问父组件的 provide：

```vue
<!-- 父组件 -->
<script setup>
import { provide } from 'vue'
provide('theme', 'dark')
</script>

<template>
  <ChildComponent>
    <template #default>
      <!-- 可以访问 theme -->
      <div class="content">{{ theme }}</div>
    </template>
  </ChildComponent>
</script>
```

### 最佳实践总结

1. **优先使用具名插槽**：当组件有多个插入点时，使用具名插槽让代码更清晰
2. **避免过深的插槽嵌套**：过深的插槽嵌套会导致代码难以维护，考虑使用组合式组件
3. **合理使用作用域插槽**：当需要向插槽内容传递数据时使用，但避免过度使用
4. **插槽命名规范**：使用描述性名称，如 `#header`、`#footer`、`#item`
5. **注意插槽的响应式**：插槽内容会自动响应式更新，但避免在插槽内创建大量响应式开销
6. **TypeScript 支持**：在 Vue 3 + TSX 中，充分利用类型推导处理插槽

---

## 相关示例

- [基础插槽](./slot-default.html)
- [具名插槽](./slot-name-only.html)
- [多具名插槽](./slot-name-multi.html)
- [动态插槽](./slot-dynamic.html)
- [作用域插槽](./slotscoped.html)
- [Render 函数中的插槽](./render-slots.html)
- [函数组件中的插槽](./slot-in-function-render.html)
