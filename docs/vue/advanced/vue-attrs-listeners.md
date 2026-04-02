# Vue 3 自定义渲染器（Custom Renderer）

> Vue 3 的核心渲染引擎是平台无关的，通过自定义渲染器，你可以将 Vue 的响应式系统扩展到任何渲染目标：WebGL、Canvas、终端（CLI）、Native 等。

## 目录

1. [核心概念](#1-核心概念)
2. [为什么需要自定义渲染器](#2-为什么需要自定义渲染器)
3. [渲染器 API](#3-渲染器-api)
4. [完整示例：创建终端渲染器](#4-完整示例创建终端渲染器)
5. [完整示例：创建 Canvas 渲染器](#5-完整示例创建-canvas-渲染器)
6. [自定义节点操作](#6-自定义节点操作)
7. [与 Vue 响应式系统集成](#7-与-vue-响应式系统集成)
8. [实际应用场景](#8-实际应用场景)

---

## 1. 核心概念

### 什么是自定义渲染器？

Vue 3 的 `createApp` 接受一个**渲染器选项**对象，允许你自定义所有 DOM 操作：

```js
import { createApp } from 'vue'

// 创建自定义渲染器
const renderer = createRenderer({
  createElement(type) {
    // 如何创建元素
  },
  insert(child, parent, anchor) {
    // 如何插入元素
  },
  remove(child) {
    // 如何删除元素
  },
  patchProp(el, key, prevValue, nextValue) {
    // 如何更新属性
  },
  // ... 其他 API
})

// 使用自定义渲染器
const app = renderer.createApp(App)
app.mount('#app')
```

### 与默认 Vue App 的区别

```
标准 Vue App (Web)
├── createApp(App)
├── DOM 渲染器（内置）
└── 输出：HTML 页面

自定义渲染器
├── createApp(App) + 渲染器选项
├── 自定义元素创建/更新逻辑
└── 输出：Canvas / Terminal / Native UI / ...
```

---

## 2. 为什么需要自定义渲染器？

### 常见应用场景

| 场景 | 描述 | 示例 |
|------|------|------|
| **终端应用** | 在 CLI 中渲染 UI | Ink (React)、VueTerm |
| **Canvas/WebGL** | 游戏或可视化 | Vue + Three.js |
| **Native 组件** | 跨平台移动应用 | NativeScript、Quasar |
| **PDF/图片** | 生成静态内容 | 服务端渲染到 PDF |
| **邮件模板** | 渲染邮件 HTML | JuiceFS Email |
| **AR/VR** | 增强现实界面 | WebXR 应用 |

### Vue 3 的优势

- **平台无关**：Vue 3 从设计上分离了平台代码
- **Tree-shaking**：只打包需要的平台代码
- **完整的响应式**：所有 Vue 特性（computed、watch 等）都可用

---

## 3. 渲染器 API

### 完整渲染器选项

```js
const renderer = createRenderer({
  // --- 元素操作 ---
  createElement(type, props, children) {
    // 创建元素节点
  },
  
  createText(text) {
    // 创建文本节点
  },
  
  createComment(text) {
    // 创建注释节点
  },
  
  // --- 父子关系 ---
  insert(child, parent, anchor) {
    // 插入子节点到父节点
  },
  
  remove(child) {
    // 移除节点
  },
  
  // --- 属性更新 ---
  patchProp(el, key, prevValue, nextValue) {
    // 更新元素属性
  },
  
  // --- 挂载/更新 ---
  mount(element, container) {
    // 挂载到容器
  },
  
  update(element, vnode) {
    // 更新元素
  },
  
  // --- 卸载 ---
  unmount(element) {
    // 卸载元素
  },
  
  // --- 查询 ---
  parentNode(node) {
    // 获取父节点
  },
  
  nextSibling(node) {
    // 获取下一个兄弟节点
  },
  
  setElementText(node, text) {
    // 设置元素文本
  },
  
  setText(node, text) {
    // 设置文本节点内容
  }
})
```

### createRenderer 完整签名

```js
import { createRenderer, createApp } from 'vue'

// createRenderer 返回 { render, createApp }
// createApp 是 createRenderer 的便捷包装

const { render, createApp: createCustomApp } = createRenderer({
  // 渲染器选项
})
```

### 关键 API 详解

#### createElement

```js
createElement(type, props, children) {
  // type: 元素类型，如 'div', 'span'
  // props: 元素属性对象
  // children: 子节点数组
  // 返回：自定义节点对象
  
  return {
    type,
    props,
    children,
    el: null // 渲染器自行管理
  }
}
```

#### patchProp

```js
patchProp(el, key, prevValue, nextValue) {
  // 处理属性更新的核心逻辑
  // 常见场景：
  // - style: { color: 'red' }
  // - class: 'active'
  // - event: @click handler
  // - value/input 等特殊处理
}
```

---

## 4. 完整示例：创建终端渲染器

### 目标

用 Vue 响应式系统渲染终端 UI：

```
┌─────────────────────────────┐
│  Counter: 0                 │
│  [Increment] [Decrement]    │
│                             │
│  Message: Hello World       │
└─────────────────────────────┘
```

### 实现

```js
import { createRenderer, h, ref, onMounted } from 'vue'

// 终端渲染器
function createTerminalRenderer(output) {
  // output: 写入输出的函数
  
  const nodeOps = {
    // 创建元素
    createElement(type, { style, class: cls, onClick, ...props }, children) {
      return {
        type,
        props: { style, class: cls, onClick, ...props },
        children: children.flat(),
        el: null
      }
    },
    
    // 创建文本
    createText(text) {
      return { type: 'text', text, el: null }
    },
    
    // 创建注释
    createComment(text) {
      return { type: 'comment', text, el: null }
    },
    
    // 插入节点
    insert(child, parent, anchor) {
      parent.children = parent.children || []
      parent.children.push(child)
      child.parent = parent
      renderNode(child)
    },
    
    // 卸载
    unmount(node) {
      // 终端不需要真正卸载，只是标记
      node.unmounted = true
    },
    
    // 移除
    remove(child) {
      child.parent = null
    },
    
    // 更新属性
    patchProp(node, key, _, nextValue) {
      if (key === 'style') {
        node.props.style = nextValue
      } else if (key === 'class') {
        node.props.class = nextValue
      } else if (key.startsWith('on')) {
        node.props[key] = nextValue
      }
      if (!node.unmounted) {
        renderNode(node)
      }
    },
    
    // 设置文本
    setText(node, text) {
      node.text = text
      renderNode(node)
    },
    
    // 设置元素文本
    setElementText(node, text) {
      node.children = [{ type: 'text', text }]
      renderNode(node)
    },
    
    // 获取父节点
    parentNode(node) {
      return node.parent
    },
    
    // 获取下一个兄弟
    nextSibling(node) {
      const siblings = node.parent?.children || []
      const idx = siblings.indexOf(node)
      return siblings[idx + 1]
    }
  }
  
  // 渲染节点到终端
  function renderNode(node) {
    if (node.type === 'text') {
      output(node.text)
    } else if (node.type === 'comment') {
      // 注释不渲染
    } else {
      // 标签处理
      const { type, props, children } = node
      const classStr = props.class ? ` class="${props.class}"` : ''
      const styleStr = props.style 
        ? ` style="${Object.entries(props.style).map(([k,v]) => `${k}:${v}`).join(';')}"` 
        : ''
      
      output(`<${type}${classStr}${styleStr}>`)
      if (children) {
        children.forEach(renderNode)
      }
      output(`</${type}>`)
    }
  }
  
  const { render, createApp } = createRenderer(nodeOps)
  
  return { render, createApp }
}
```

### 使用终端渲染器

```js
import { ref } from 'vue'

const Counter = {
  setup() {
    const count = ref(0)
    
    function increment() {
      count.value++
    }
    
    function decrement() {
      count.value--
    }
    
    return () => h('div', { class: 'counter' }, [
      h('p', {}, `Count: ${count.value}`),
      h('button', { onClick: increment }, '+'),
      h('button', { onClick: decrement }, '-')
    ])
  }
}

// 创建应用
const { createApp } = createTerminalRenderer(text => {
  terminalOutput += text + '\n'
  updateTerminal()
})

const app = createApp(Counter)
app.mount()
```

---

## 5. 完整示例：创建 Canvas 渲染器

### 目标

用 Vue 渲染 Canvas 2D 图形：

```js
import { createCanvasApp } from './canvas-renderer'

const App = {
  setup() {
    const x = ref(100)
    const y = ref(100)
    
    function move(dx, dy) {
      x.value += dx
      y.value += dy
    }
    
    return () => h('group', [
      h('circle', { cx: x.value, cy: y.value, r: 50, fill: 'blue' }),
      h('rect', { x: x.value - 25, y: y.value + 60, width: 50, height: 20, fill: 'green' })
    ])
  }
}

createCanvasApp(App).mount(canvas)
```

### Canvas 渲染器实现

```js
import { createRenderer, h } from 'vue'

function createCanvasRenderer(canvas) {
  const ctx = canvas.getContext('2d')
  
  const nodeOps = {
    createElement(type) {
      return { type, props: {}, children: [] }
    },
    
    createText(text) {
      return { type: 'text', text }
    },
    
    insert(child, parent, anchor) {
      parent.children = parent.children || []
      parent.children.push(child)
      child.parent = parent
    },
    
    remove(child) {
      // 标记删除
      child.removed = true
    },
    
    patchProp(node, key, _, nextValue) {
      node.props[key] = nextValue
    },
    
    setElementText(node, text) {
      node.children = [{ type: 'text', text }]
    },
    
    setText(node, text) {
      node.text = text
    },
    
    parentNode(node) {
      return node.parent
    },
    
    nextSibling(node) {
      const siblings = node.parent?.children || []
      return siblings[siblings.indexOf(node) + 1]
    }
  }
  
  function renderTree(node) {
    if (!node || node.removed) return
    
    ctx.save()
    
    switch (node.type) {
      case 'group':
        // group 不画东西，只是变换上下文
        node.children?.forEach(renderTree)
        break
        
      case 'circle':
        ctx.beginPath()
        ctx.arc(node.props.cx, node.props.cy, node.props.r, 0, Math.PI * 2)
        ctx.fillStyle = node.props.fill || 'black'
        ctx.fill()
        if (node.props.stroke) {
          ctx.stroke()
        }
        break
        
      case 'rect':
        ctx.fillStyle = node.props.fill || 'black'
        ctx.fillRect(node.props.x, node.props.y, node.props.width, node.props.height)
        break
        
      case 'text':
        ctx.font = node.props.font || '16px sans-serif'
        ctx.fillText(node.text || '', node.props.x || 0, node.props.y || 0)
        break
    }
    
    ctx.restore()
    
    // 递归渲染子节点
    node.children?.forEach(renderTree)
  }
  
  const { render, createApp } = createRenderer({
    ...nodeOps,
    mount(vnode, container) {
      container._vnode = vnode
      renderTree(vnode)
    },
    patch(vnode, newVnode) {
      renderTree(newVnode)
    }
  })
  
  return { render, createApp }
}

export function createCanvasApp(App) {
  const { createApp } = createCanvasRenderer(canvas)
  return createApp(App)
}
```

---

## 6. 自定义节点操作

### 处理事件

```js
patchProp(node, key, prevValue, nextValue) {
  if (key.startsWith('on')) {
    // 绑定事件
    node.events = node.events || {}
    node.events[key] = nextValue
  } else if (key === 'style') {
    node.props.style = nextValue
  } else if (key === 'class') {
    node.props.class = nextValue
  } else {
    node.props[key] = nextValue
  }
}

// 触发事件
function triggerEvent(node, eventName, args) {
  const handler = node.events[`on${eventName}`]
  if (handler) {
    handler(...args)
  }
}
```

### 处理 style

```js
patchProp(node, key, prevValue, nextValue) {
  if (key === 'style') {
    node.props.style = { ...node.props.style, ...nextValue }
  } else {
    node.props[key] = nextValue
  }
}

// 应用样式到元素
function applyStyle(ctx, style) {
  if (!style) return
  if (style.color) ctx.fillStyle = style.color
  if (style.fontSize) ctx.font = `${style.fontSize}px sans-serif`
  // ...
}
```

---

## 7. 与 Vue 响应式系统集成

### 完整集成示例

```js
import { createRenderer, h, ref, reactive, computed, watch, onMounted } from 'vue'

// 响应式数据驱动的渲染器
function createReactiveRenderer(options) {
  const renderer = createRenderer(options)
  
  // 包装 createApp，添加响应式支持
  const originalCreateApp = renderer.createApp.bind(renderer)
  
  renderer.createApp = (app) => {
    const vueApp = originalCreateApp(app)
    
    // 在挂载后启动响应式更新循环
    const originalMount = vueApp.mount
    vueApp.mount = (...args) => {
      const vm = originalMount(...args)
      
      // 启动更新循环
      let active = true
      function update() {
        if (!active) return
        const vnode = vm.$
```

---

The rendering system maintains a queue to batch DOM updates asynchronously via `queueJob`, ensuring efficient updates without blocking the main thread. The `flushPostFlushCbs` function processes any post-flush callbacks after updates complete.

For hydration, Vue checks if the DOM element already exists during mount—if it does, it reuses the existing content rather than replacing it entirely.

Beyond the browser, Vue's rendering API supports other environments like SSR, where server-rendered HTML gets hydrated on the client by traversing and attaching event listeners to existing nodes. This same pattern applies to custom targets like canvas, PDF generation, and terminal interfaces where you manage your own rendering surface.

For complex custom renderers, the platform-specific operations needed include element creation, text handling, DOM insertion and removal, prop updates, and tree traversal methods like finding parent or sibling nodes. Vue ecosystem projects like vue-term, ink-vue, and Quasar have already implemented custom renderers for various environments.
</think>


<minimax:tool_call>
<invoke name="write">
<parameter name="content"># Vue 子组件检测父组件监听器：$attrs / $listeners

> 本文档详解 Vue 子组件如何检测父组件是否绑定了监听器，以及 $attrs 和 $listeners 的最佳实践。

## 目录

1. [核心概念](#1-核心概念)
2. [Vue 2 vs Vue 3 对比](#2-vue-2-vs-vue-3-对比)
3. [inheritAttrs 行为](#3-inheritattrs-行为)
4. [检测父组件监听器的方法](#4-检测父组件监听器的方法)
5. [实战示例](#5-实战示例)
6. [常见问题](#6-常见问题)

---

## 1. 核心概念

### 什么是 $attrs？

`$attrs` 包含**父组件传递但子组件未在 props 中声明**的所有属性（包括 `class`、`style`、`id`、`data-*`、`aria-*`、非 `v-on` 事件监听器等）。

### 什么是 $listeners？（Vue 2 专属，Vue 3 已合并到 $attrs）

在 Vue 2 中，`$listeners` 包含父组件传递的**所有事件监听器**（`v-on` 指令绑定的事件）。

在 Vue 3 中，`$listeners` 已被**移除**，所有监听器都合并到 `$attrs` 中，通过 `onXxx` 属性名标识。

### 图解

```
父组件:
<MyButton type="primary" class="btn-lg" @click="handleClick" @focus="handleFocus" />

子组件 (MyButton):
- props: ['type']          ← 声明了 type
- attrs: { class: 'btn-lg', @click: handleClick, @focus: handleFocus }  ← 未声明的部分

type 在 props 中 → 不在 $attrs 中
class 在 attrs 中 → 在 $attrs 中
@click 在 $attrs 中 → 在 $attrs 中 (Vue 3)
```

---

## 2. Vue 2 vs Vue 3 对比

### Vue 2

```html
<!-- 父组件 -->
<MyButton 
  type="primary"
  @click="handleClick"
  @focus="handleFocus"
  class="custom-btn"
/>

<!-- 子组件 -->
<script>
export default {
  props: ['type'], // 只声明 type
  
  created() {
    // $attrs 包含: { class: 'custom-btn', @click: ..., @focus: ... }
    // $listeners 包含: { click: ..., focus: ... }
    
    console.log('$attrs:', this.$attrs)     // { class: 'custom-btn' }
    console.log('$listeners:', this.$listeners) // { click: fn, focus: fn }
  }
}
</script>
```

### Vue 3

```html
<!-- 父组件 -->
<MyButton 
  type="primary"
  @click="handleClick"
  @focus="handleFocus"
  class="custom-btn"
/>

<!-- 子组件 (组合式 API) -->
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
// attrs 包含: { type: undefined（未接收）, class: 'custom-btn', onClick: fn, onFocus: fn }
</script>
```

```js
// Vue 3 $attrs 结构
{
  class: 'custom-btn',
  onClick: function() { /* ... */ },
  onFocus: function() { /* ... */ }
}
```

---

## 3. inheritAttrs 行为

### 默认行为

```html
<!-- 父组件 -->
<MyInput 
  placeholder="Enter text"
  class="input-field"
  id="username"
  @input="handleInput"
/>
```

```html
<!-- 子组件 MyInput -->
<!-- 如果不声明 props -->
<template>
  <div>
    <!-- $attrs 中的非 prop 属性会渲染到根元素上 -->
    <!-- placeholder, class, id 会自动渲染 -->
    <!-- @input 需要手动处理 -->
    <input v-bind="$attrs" />
  </div>
</template>
```

渲染结果：

```html
<!-- inheritAttrs: true（默认）时，未声明的 attrs 渲染到根元素 -->
<div>
  <input 
    placeholder="Enter text" 
    class="input-field" 
    id="username" 
  />
</div>
```

### 禁用 inheritAttrs

```js
export default {
  name: 'MyInput',
  inheritAttrs: false, // 禁用自动继承
  props: ['placeholder']
}
```

```html
<!-- 手动控制 attrs 应用位置 -->
<template>
  <div class="wrapper">
    <input v-bind="$attrs" class="my-input" />
    <!-- 或者传递到其他元素 -->
    <span v-bind="$attrs">{{ label }}</span>
  </div>
</template>
```

---

## 4. 检测父组件监听器的方法

### 方法一：检测 $attrs 中的事件属性（Vue 3）

```html
<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

// 检测是否绑定了特定事件
const hasClickHandler = computed(() => {
  return 'onClick' in attrs
})

// 检测是否绑定了多个事件
const hasFocusHandlers = computed(() => {
  return 'onFocus' in attrs && 'onBlur' in attrs
})

// 检测任意事件
const hasAnyEventHandlers = computed(() => {
  return Object.keys(attrs).some(key => key.startsWith('on'))
})
</script>
```

### 方法二：检测 $listeners（Vue 2）

```js
export default {
  computed: {
    hasClick() {
      return !!this.$listeners.click
    },
    
    hasFocus() {
      return !!this.$listeners.focus
    }
  },
  
  created() {
    if (!this.hasClick) {
      console.warn('父组件未绑定 click 事件')
    }
  }
}
```

### 方法三：通过 v-bind="$attrs" 自动传递

```html
<!-- 子组件希望"透传"父组件的属性给内部元素 -->
<template>
  <!-- 不使用 inheritAttrs 的场景 -->
  <div class="wrapper">
    <!-- $attrs 会自动传递给 button -->
    <button v-bind="$attrs" class="my-btn">
      <slot />
    </button>
  </div>
</template>
```

父组件：

```html
<MyButton type="primary" @click="handle" class="custom" />
```

子组件会自动把 `type` 和 `class` 传递给内部的 `<button>`，无需手动 `:class="$attrs.class"`。

---

## 5. 实战示例

### 5.1 智能包装组件

```html
<!-- Button.vue - 自动适配 href 属性 -->
<template>
  <!-- 如果传了 href，使用 <a>；否则使用 <button> -->
  <a v-if="isLink" v-bind="$attrs" class="btn">
    <slot />
  </a>
  <button v-else v-bind="$attrs" class="btn">
    <slot />
  </button>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

// 检测父组件是否传递了 href 属性
const isLink = computed(() => !!attrs.href)
</script>
```

使用：

```html
<!-- 生成 <a> 标签 -->
<Button href="https://example.com" class="external-link">链接按钮</Button>

<!-- 生成 <button> 标签 -->
<Button @click="handle" class="normal-btn">普通按钮</Button>
```

### 5.2 事件代理组件

```html
<!-- EventProxy.vue - 代理所有事件 -->
<template>
  <div v-bind="$attrs" @click="handleClick">
    <slot />
  </div>
</template>

<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

function handleClick(event) {
  // 触发父组件传入的 click 事件
  attrs.onClick?.(event)
}

// 转发其他事件
function forwardEvent(eventName, ...args) {
  const handler = attrs[`on${eventName}`]
  if (handler) {
    handler(...args)
  }
}
</script>
```

### 5.3 FormField 组件（自动转发 input 事件）

```html
<!-- FormField.vue -->
<template>
  <div class="form-field">
    <label v-if="label">{{ label }}</label>
    <!-- 自动转发所有 attrs 到 input -->
    <input v-bind="$attrs" class="form-input" />
  </div>
</template>

<script setup>
defineProps(['label'])
</script>
```

使用：

```html
<!-- 所有 input 属性和事件都会自动传递 -->
<FormField 
  label="用户名"
  type="text"
  placeholder="请输入用户名"
  v-model="username"
  @focus="handleFocus"
  @blur="handleBlur"
  class="custom-field"
/>
```

### 5.4 检测缺失事件并警告

```js
// warn-if-no-listener.js
export function useWarnIfNoListener(eventName, componentName) {
  const attrs = useAttrs()
  
  watch(
    () => attrs[`on${eventName}`],
    (handler) => {
      if (!handler) {
        console.warn(
          `[${componentName}] 建议为 '${eventName}' 事件提供处理器`
        )
      }
    },
    { immediate: true }
  )
}
```

使用：

```html
<script setup>
import { useWarnIfNoListener } from './warn-if-no-listener'

// 如果父组件没有绑定 click，会输出警告
useWarnIfNoListener('Click', 'MyButton')
</script>
```

### 5.5 Vue 2 中的 $listeners 透传

```html
<!-- 父组件 -->
<ParentComponent 
  @click="handleClick"
  @focus="handleFocus"
  class="parent-class"
/>

<!-- 子组件 -->
<script>
export default {
  name: 'ChildWrapper',
  
  // 在 created 中检查
  created() {
    console.log('所有事件监听器:', Object.keys(this.$listeners))
    // ['click', 'focus']
    
    // 检查特定事件
    if (!this.$listeners.click) {
      console.warn('请提供 click 事件处理')
    }
  }
}
</script>

<template>
  <!-- 传递所有 attrs 和 listeners 给子元素 -->
  <button v-bind="$attrs" v-on="$listeners" class="child-btn">
    <slot />
  </button>
</template>
```

---

## 6. 常见问题

### Q: 如何区分 prop 和 $attrs？

```js
// 子组件声明
props: ['type', 'disabled']

// 父组件传递
<MyButton type="primary" disabled class="custom" @click="handle" />

// 结果：
// - type: 在 props 中 → 不在 $attrs 中
// - disabled: 在 props 中 → 不在 $attrs 中
// - class: 不在 props 中 → 在 $attrs 中
// - onClick: 不在 props 中 → 在 $attrs 中
```

### Q: v-on="$listeners" 在 Vue 3 中还有吗？

**没有了。** Vue 3 中统一使用 `v-bind="$attrs"`，因为事件监听器已经合并到 `$attrs` 中。

```html
<!-- Vue 3 -->
<button v-bind="$attrs">点击</button>
```

### Q: 如何让子组件"不继承"某些属性？

1. **在子组件中声明为 prop** → 自动从 $attrs 移除
2. **设置 `inheritAttrs: false`** → 不渲染到根元素，但可通过 `$attrs` 手动应用

### Q: $attrs 在组合式 API 中如何使用？

```js
import { useAttrs, defineProps } from 'vue'

// 方式一：在 setup 中直接使用
setup(props, { attrs }) {
  console.log(attrs.class)  // 透传的 class
  console.log(attrs.onClick) // 透传的事件
}

// 方式二：使用 useAttrs()（Composition API 语法糖）
const attrs = useAttrs()
```

---

## 参考资料

- [Vue 3 官方文档 - $attrs](https://vuejs.org/api/component-instance.html#attrs)
- [Vue 3 官方文档 - 透传 Attributes](https://vuejs.org/guide/components/attrs.html)
- [Vue RFC - 移除 $listeners](https://github.com/vuejs/rfcs/blob/master/rfcs/0041-replace-v-bind-sync-with-v-model-argument.md)
