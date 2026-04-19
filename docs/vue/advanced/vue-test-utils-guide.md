# Vue Test Utils 完整指南

## 概述

Vue Test Utils (VTU) 是 Vue.js 官方提供的单元测试工具库，用于测试 Vue 组件。

## 版本说明

- **VTU v1**: 对应 Vue 2
- **VTU v2**: 对应 Vue 3

本文档基于 VTU v2（Vue 3）。

## 核心 API

### 1. mount / shallowMount

#### mount
完整挂载组件，包括子组件：

```javascript
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

const wrapper = mount(MyComponent, {
  props: {
    msg: 'Hello'
  },
  data() {
    return {
      count: 0
    }
  }
})
```

#### shallowMount
只挂载当前组件，不渲染子组件（stub）：

```javascript
import { shallowMount } from '@vue/test-utils'

const wrapper = shallowMount(MyComponent)
```

### 2. Wrapper 方法

#### 查找元素
```javascript
// 按 CSS 选择器
wrapper.find('.button')
wrapper.find('#submit')

// 按组件
wrapper.findComponent(ChildComponent)

// 按 ref
wrapper.find({ ref: 'myRef' })

// 按标签
wrapper.find('button')
```

#### 触发事件
```javascript
wrapper.find('.button').trigger('click')
wrapper.find('form').trigger('submit.prevent')
```

#### 获取元素
```javascript
wrapper.find('.title').text()  // 文本内容
wrapper.find('img').attributes()  // 属性
wrapper.find('input').attributes('value')  // 特定属性
wrapper.find('.card').classes()  // 类名列表
```

### 3. 生命周期方法

#### 触发更新
```javascript
await wrapper.vm.$nextTick()
// 或
await wrapper.trigger('input')
```

### 4. 模拟 Props

```javascript
const wrapper = mount(Component, {
  props: {
    title: 'Hello',
    count: 5
  }
})

expect(wrapper.props('title')).toBe('Hello')
```

### 5. 模拟事件

```javascript
const wrapper = mount(Component)

wrapper.vm.$emit('custom-event', 'payload')
expect(wrapper.emitted('custom-event')).toBeTruthy()
expect(wrapper.emitted('custom-event')[0]).toEqual(['payload'])
```

### 6. 插槽测试

```javascript
import { mount } from '@vue/test-utils'

const wrapper = mount(Component, {
  slots: {
    default: 'Default Slot Content',
    header: '<h1>Header</h1>',
    footer: Component定义
  }
})
```

### 7. provide/inject 测试

```javascript
const provide = {
  theme: 'dark'
}

const wrapper = mount(Component, {
  global: {
    provide
  }
})
```

## 测试示例

### 基础组件测试

```vue
<!-- Button.vue -->
<template>
  <button 
    :class="['btn', type]" 
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    type: {
      type: String,
      default: 'primary'
    },
    disabled: Boolean
  },
  emits: ['click'],
  methods: {
    handleClick(event) {
      if (!this.disabled) {
        this.$emit('click', event)
      }
    }
  }
}
</script>
```

```javascript
// Button.spec.js
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button', () => {
  it('renders with default type', () => {
    const wrapper = mount(Button)
    expect(wrapper.classes()).toContain('btn')
    expect(wrapper.classes()).toContain('primary')
  })

  it('renders with custom type', () => {
    const wrapper = mount(Button, {
      props: { type: 'danger' }
    })
    expect(wrapper.classes()).toContain('danger')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('renders slot content', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Submit' }
    })
    expect(wrapper.text()).toBe('Submit')
  })
})
```

### 表单组件测试

```vue
<!-- Input.vue -->
<template>
  <div class="input-wrapper">
    <input 
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<script>
export default {
  name: 'Input',
  props: {
    modelValue: String,
    type: { type: String, default: 'text' },
    placeholder: String,
    error: String
  },
  emits: ['update:modelValue']
}
</script>
```

```javascript
// Input.spec.js
import { mount } from '@vue/test-utils'
import Input from './Input.vue'

describe('Input', () => {
  it('renders with placeholder', () => {
    const wrapper = mount(Input, {
      props: { placeholder: 'Enter name' }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter name')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Input)
    const input = wrapper.find('input')
    
    await input.setValue('test')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['test'])
  })

  it('displays error message', () => {
    const wrapper = mount(Input, {
      props: { error: 'Invalid input' }
    })
    expect(wrapper.find('.error').text()).toBe('Invalid input')
  })
})
```

### 异步组件测试

```javascript
import { mount, flushPromises } from '@vue/test-utils'
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() => 
  Promise.resolve({ template: '<div>Async</div>' })
)

describe('AsyncComponent', () => {
  it('renders async component', async () => {
    const wrapper = mount(AsyncComponent)
    await flushPromises()
    expect(wrapper.text()).toBe('Async')
  })
})
```

## 常见问题

### 1. 找不到元素

```javascript
// 错误：使用了 text() 而不是 find()
expect(wrapper.text()).toContain('title')  // ❌

// 正确：使用 find() 获取元素
expect(wrapper.find('.title').text()).toContain('title')  // ✓
```

### 2. 异步更新

```javascript
// 错误：没有等待异步更新
wrapper.find('input').setValue('test')
expect(wrapper.emitted('update:modelValue')).toBeTruthy()  // ❌

// 正确：使用 await
await wrapper.find('input').setValue('test')
expect(wrapper.emitted('update:modelValue')).toBeTruthy()  // ✓

// 或使用 flushPromises
import { flushPromises } from '@vue/test-utils'
await flushPromises()
```

### 3. 全局插件/混入

```javascript
const wrapper = mount(Component, {
  global: {
    plugins: [router, pinia],
    mocks: {
      $t: (key) => key
    }
  }
})
```

## 测试策略

### 1. 测试分类
- **单元测试**: 测试单独的组件
- **集成测试**: 测试多个组件协作
- **端到端测试**: 测试完整流程（使用 Cypress/Playwright）

### 2. 测试金字塔
```
        /\
       /  \
      / E2E\      <- 少量 E2E 测试
     /------\
    /集成测试\    <- 中等数量集成测试
   /----------\
  /  单元测试   \  <- 大量单元测试
 /--------------\
```

### 3. 覆盖率目标
- 组件测试覆盖率: 70%+
- 关键业务组件: 90%+

## 相关资源

- [Vue Test Utils 官方文档](https://test-utils.vuejs.org/)
- [Vue.js 测试指南](https://vuejs.org/guide/scaling-up/testing.html)
- [Vitest](https://vitest.dev/) - Vite 原生测试框架

## 更新日志

- 2026-04-19：初始文档，基于 Vue Test Utils 官方文档整理
