# v-html  alternatives for JSX and Custom Components in Vue

> Understanding why `v-html` cannot handle Vue components and exploring three main alternatives for dynamic component rendering.

## Table of Contents

[[toc]]

## 1. Why v-html Cannot Handle Vue Components

### 1.1 How v-html Works

`v-html` is designed to render **raw HTML strings** into the DOM. It uses the browser's native `innerHTML` API, which simply parses the string as HTML markup.

```vue
<!-- This works for raw HTML -->
<template>
  <div v-html="'<strong>Bold Text</strong>'"></div>
</template>
```

### 1.2 The Core Problem

**`v-html` only parses raw HTML strings — it cannot understand or render Vue components.**

When you use `v-html`, Vue passes the string to the browser's HTML parser:

1. The browser parses the string as static HTML
2. No Vue compilation step occurs
3. No Vue reactivity is engaged
4. No Vue lifecycle hooks are triggered for the "inserted" content

```vue
<!-- ❌ This will NOT work as expected -->
<template>
  <div v-html="'<MyComponent :msg=\"hello\" />'"></div>
</template>

<script setup>
const MyComponent = resolveComponent('MyComponent')
const hello = 'Hello World'
// The string "<MyComponent :msg="Hello World" />" is treated as literal HTML
// No Vue component is actually rendered
</script>
```

### 1.3 What v-html Cannot Do

| Feature | v-html Support |
|---------|----------------|
| Raw HTML elements | ✅ Yes |
| Vue components | ❌ No |
| JSX syntax | ❌ No |
| Vue directives | ❌ No |
| Vue reactivity in content | ❌ No |
| Component events | ❌ No |
| Slots integration | ❌ No |

---

## 2. Alternative 1: Dynamic Component with `component :is`

### 2.1 Basic Usage

The `<component :is="">` directive is Vue's built-in mechanism for dynamically rendering different components.

```vue
<template>
  <component :is="currentComponent" />
</template>

<script setup>
import { ref } from 'vue'
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'

const currentComponent = ref(ComponentA)

const switchComponent = (name) => {
  currentComponent.value = name === 'A' ? ComponentA : ComponentB
}
</script>
```

### 2.2 With Component Name String

You can also use component names as strings (useful for components registered globally):

```vue
<template>
  <component :is="componentName" :prop="propValue" />
</template>

<script setup>
import { ref } from 'vue'

const componentName = ref('MyComponent')
const propValue = ref('Hello')

// componentName can be:
// - String: 'MyComponent' (globally registered)
// - Object: { template: '<div>Inline</div>' }
// - Component: defineComponent({...})
</script>
```

### 2.3 Mapping Component Types

```vue
<template>
  <component :is="componentMap[componentType]" :data="props" />
</template>

<script setup>
import { ref, computed } from 'vue'
import TextWidget from './widgets/TextWidget.vue'
import ImageWidget from './widgets/ImageWidget.vue'
import VideoWidget from './widgets/VideoWidget.vue'

const componentType = ref('text')

const componentMap = {
  text: TextWidget,
  image: ImageWidget,
  video: VideoWidget
}

const props = computed(() => ({
  // Dynamic props based on type
  content: 'Dynamic content'
}))
</script>
```

### 2.4 Pros and Cons

| Pros | Cons |
|------|------|
| Native Vue feature, no setup required | Requires component mapping for string-based lookup |
| Full Vue reactivity support | Components must be imported or registered |
| Supports all component features (props, events, slots) | Limited to pre-defined component list |

---

## 3. Alternative 2: Render Function with JSX

### 3.1 JSX in Vue 3

Vue 3 supports JSX through the `@vitejs/plugin-vue-jsx` plugin. JSX provides a more flexible way to render dynamic content.

```vue
<script setup>
import { ref, h } from 'vue'

const dynamicJSX = ref(
  <div class="dynamic">
    <h1>Hello from JSX</h1>
    <p>This is rendered dynamically</p>
  </div>
)
</script>

<template>
  <VNode :vnode="dynamicJSX" />
</template>
```

### 3.2 Creating a Wrapper Component for JSX

Since Vue templates cannot directly render JSX, create a wrapper component:

```vue
<!-- JsxRenderer.vue -->
<script setup>
import { h, resolveComponent } from 'vue'

const props = defineProps({
  code: {
    type: String,
    default: ''
  }
})

// Parse and render JSX dynamically
const renderJsx = () => {
  // In real implementation, use a JSX transpiler
  // This requires additional setup like esbuild or babel
}
</script>

<template>
  <div v-html="code" />
</template>
```

### 3.3 Functional Component Approach

```vue
<script setup>
import { h, defineProps } from 'vue'

// Simple functional component for JSX
const DynamicRenderer = (props, { slots }) => {
  return h('div', { class: 'renderer' }, slots.default?.())
}

defineProps({
  config: Object
})
</script>
```

### 3.4 Pros and Cons

| Pros | Cons |
|------|------|
| Familiar JSX syntax for React developers | Requires additional build plugin configuration |
| Can embed expressions directly | JSX in template strings is harder to debug |
| Flexible conditional rendering | Security concerns with user-provided JSX |

---

## 4. Alternative 3: Custom Component with v-model + Slot

### 4.1 Dynamic Slot Content

For maximum flexibility, use a component that accepts slot content dynamically:

```vue
<!-- DynamicContent.vue -->
<script setup>
defineProps({
  mode: {
    type: String,
    default: 'default' // 'default' | 'preview' | 'edit'
  },
  data: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div class="dynamic-container">
    <slot v-if="mode === 'preview'" name="preview" :data="data" />
    <slot v-else-if="mode === 'edit'" name="edit" :data="data" />
    <slot v-else name="default" :data="data" />
  </div>
</template>
```

### 4.2 Usage with Scoped Slots

```vue
<template>
  <DynamicContent :mode="currentMode" :data="formData">
    <template #default="{ data }">
      <div>Default: {{ data.message }}</div>
    </template>

    <template #preview="{ data }">
      <div class="preview">Preview: {{ data.message }}</div>
    </template>

    <template #edit="{ data }">
      <input v-model="data.message" />
    </template>
  </DynamicContent>
</template>
```

### 4.3 Render Props Pattern

```vue
<script setup>
import { ref } from 'vue'
import RenderWrapper from './RenderWrapper.vue'

const componentConfig = ref({
  type: 'card',
  props: { title: 'Hello', content: 'World' },
  events: { onClick: handleClick }
})

const handleClick = () => console.log('Clicked!')
</script>

<template>
  <RenderWrapper :config="componentConfig">
    <template #component="{ config }">
      <!-- Dynamic component rendering -->
      <component
        :is="resolveComponent(config.type)"
        v-bind="config.props"
        v-on="config.events"
      />
    </template>
  </RenderWrapper>
</template>
```

### 4.4 Pros and Cons

| Pros | Cons |
|------|------|
| Full Vue reactivity in slot content | More boilerplate code |
| Type-safe with TypeScript | Requires wrapper component |
| Supports multiple dynamic sections | Slot props must be explicitly passed |

---

## 5. Comparison Summary

| Feature | `component :is` | JSX | Slot Pattern |
|---------|-----------------|-----|-------------|
| Setup complexity | Low | Medium | Low |
| Type safety | Medium | Low | High |
| Flexibility | Medium | High | High |
| Debugging | Easy | Medium | Easy |
| Performance | High | High | High |
| Security | High | Medium | High |

---

## 6. Best Practices

### 6.1 When to Use Each Approach

| Scenario | Recommended Approach |
|----------|---------------------|
| Component switching | `component :is` |
| Dynamic props passing | `component :is` |
| Complex conditional rendering | JSX |
| User-generated content | Slot pattern |
| CMS/markdown with components | Slot pattern + parser |

### 6.2 Security Considerations

::: warning User Input Warning
Never render user-provided content as JSX — this can lead to XSS vulnerabilities.
:::

```vue
<!-- ❌ Dangerous with user input -->
<div v-html="userProvidedJsx" />

<!-- ✅ Safe: Use sanitized content -->
<DynamicContent :data="sanitizedData">
  <template #default="{ data }">
    <div>{{ data.content }}</div>
  </template>
</DynamicContent>
```

### 6.3 Performance Tips

1. **Use `markRaw()`** for component maps that don't need reactivity
2. **Keep component lists memoized** to avoid recreation
3. **Use `v-memo`** for expensive dynamic components in lists

---

## 7. Interactive Demo

Open the interactive demo: [v-html-alternatives-demo.html](./v-html-alternatives-demo.html)

The demo includes:
1. Dynamic component switching with `component :is`
2. JSX rendering with reactive data
3. Slot-based dynamic content rendering
4. Real-time prop passing to dynamic components
5. Security comparison (sanitized vs raw content)

---

## Related Resources

- [Vue Dynamic Components](https://v3.vuejs.org/guide/component-dynamic.html)
- [Vue JSX Plugin](https://github.com/vuejs/jsx)
- [Vue Render Functions](../vue/render.md)
- [Vue Slots](../vue/slot.md)
