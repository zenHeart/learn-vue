# Vue 批量绑定自定义指令

## 什么是批量绑定

当同一个自定义指令需要应用到多个 DOM 元素时，逐个 `v-xxx` 绑定会造成模板代码重复。批量绑定提供了一种集中管理多个指令绑定的方式，减少模板噪音，提高可维护性。

---

## 一、局部指令的批量注册

### 1.1 组件级批量注册

在 `setup` 中使用 `v-bind` + 对象语法，一次性给多个元素应用指令：

```html
<template>
  <!-- 逐个绑定：代码重复 -->
  <input v-focus v-highlight="focusColor" />
  <textarea v-focus v-highlight="focusColor" />
  <select v-focus v-highlight="focusColor" />

  <!-- 批量绑定：集中管理 -->
  <input v-bind="formDirectives" />
  <textarea v-bind="formDirectives" />
  <select v-bind="formDirectives" />
</template>

<script setup>
import { reactive, directives as localDirectives } from 'vue'

// 定义批量指令集
const formDirectives = {
  focus: true,
  highlight: 'yellow',
  ripple: true
}
</script>
```

> ⚠️ `v-bind` 对象语法不支持传递参数（arg）和修饰符，仅适用于无参数指令。

### 1.2 局部指令批量注册到组件选项

```js
// 旧版 Options API
export default {
  directives: {
    focus: { mounted: el => el.focus() },
    highlight: { mounted: (el, binding) => el.style.background = binding.value },
    tooltip: { mounted: (el, binding) => /* tooltip logic */ }
  }
}
```

```html
<!-- 模板中使用任一指令 -->
<input v-focus />
<p v-highlight="blue">Highlighted</p>
<span v-tooltip="'tip'">Has tip</span>
```

---

## 二、全局指令的批量注册

### 2.1 批量注册多个全局指令

```js
import { createApp } from 'vue'

const app = createApp({})

// 方式一：多次调用 directive
app.directive('focus', { mounted: el => el.focus() })
app.directive('highlight', { mounted: (el, binding) => el.style.background = binding.value })
app.directive('tooltip', { mounted: (el, binding) => Tooltip.show(el, binding.value) })

// 方式二：批量注册（封装）
const globalDirectives = {
  focus: { mounted: el => el.focus() },
  highlight: { mounted: (el, binding) => el.style.background = binding.value },
  tooltip: { mounted: (el, binding) => Tooltip.show(el, binding.value) },
  drag: { mounted: el => makeDraggable(el) },
  clickOutside: { mounted: (el, binding) => el.__clickOutside = e => {
    if (!el.contains(e.target)) binding.value(e)
  }}
}

Object.entries(globalDirectives).forEach(([name, definition]) => {
  app.directive(name, definition)
})
```

### 2.2 插件形式批量注册

```js
// directives/plugin.js
export const directivesPlugin = {
  install(app, globalOptions = {}) {
    const defaults = {
      highlightColor: 'yellow',
      tooltipDelay: 300,
      ...globalOptions
    }

    const directives = {
      focus: { mounted: el => el.focus() },

      highlight: {
        mounted(el, binding) {
          el.style.background = binding.value || defaults.highlightColor
        }
      },

      tooltip: {
        mounted(el, binding) {
          const delay = binding.arg || defaults.tooltipDelay
          let timer
          el.addEventListener('mouseenter', () => {
            timer = setTimeout(() => showTooltip(el, binding.value), delay)
          })
          el.addEventListener('mouseleave', () => clearTimeout(timer))
        }
      },

      permissions: {
        mounted(el, binding) {
          if (!hasPermission(binding.value)) {
            el.style.display = 'none'
          }
        }
      },

      debounce: {
        mounted(el, binding) {
          el.__debounceHandler = debounce(
            binding.value.handler,
            binding.value.wait || 300
          )
          el.addEventListener(binding.value.event || 'click', el.__debounceHandler)
        },
        unmounted(el, binding) {
          el.removeEventListener(binding.value.event || 'click', el.__debounceHandler)
        }
      }
    }

    Object.entries(directives).forEach(([name, def]) => app.directive(name, def))
  }
}

// main.js
import { createApp } from 'vue'
import { directivesPlugin } from './directives/plugin'

const app = createApp({})
app.use(directivesPlugin, { highlightColor: '#fff3cd', tooltipDelay: 500 })
```

```html
<!-- 全局可用 -->
<input v-focus />
<p v-highlight>Using default color</p>
<p v-highlight="cyan">Custom color</p>
<button v-tooltip="'Click me'">Hover</button>
<div v-permissions="'admin'">Admin panel</div>
```

---

## 三、动态参数与批量绑定的结合

### 3.1 动态指令名

```html
<script setup>
import { ref, useDirectives } from 'vue'

const activeDirective = ref('highlight')

// 切换不同指令
const directives = {
  [activeDirective.value]: 'cyan'
}
</script>

<template>
  <div v-bind="directives">Dynamic directive</div>
</template>
```

### 3.2 v-bind + 动态参数（Vue 3.4+ 支持）

```html
<template>
  <!-- 通过 computed 动态生成指令对象 -->
  <input v-bind="inputDirectives" />
</template>

<script setup>
import { computed } from 'vue'

const isDisabled = ref(false)
const inputId = ref('field-1')

const inputDirectives = computed(() => ({
  focus: true,
  highlight: isDisabled.value ? '#ccc' : '#fff3cd',
  // 动态参数用 :arg 语法
  ...(isDisabled.value && { disabled: true })
}))
</script>
```

### 3.3 批量绑定 + 条件指令

```html
<script setup>
const enabledDirectives = computed(() => {
  const dirs = {}

  if (needsFocus.value) dirs.focus = true
  if (needsHighlight.value) dirs.highlight = highlightColor.value
  if (needsTooltip.value) dirs.tooltip = tooltipText.value
  if (needsRipple.value) dirs.ripple = true

  return dirs
})
</script>

<template>
  <!-- 根据条件动态启用/禁用多个指令 -->
  <button v-bind="enabledDirectives">Action Button</button>
</template>
```

---

## 四、函数式指令的批量模式

函数式（functional）指令是简写形式，只在 `mounted` 和 `updated` 时调用：

```js
// 普通对象式
app.directive('highlight', {
  mounted(el, binding) { el.style.background = binding.value },
  updated(el, binding) { el.style.background = binding.value }
})

// 函数简写式（等效）
app.directive('highlight', (el, binding) => {
  el.style.background = binding.value
})
```

### 4.1 批量注册函数式指令

```js
// 工厂函数生成指令
function createHighlightDirective(color) {
  return (el, binding) => {
    el.style.background = binding.value || color
  }
}

function createTooltipDirective(text) {
  return {
    mounted(el, binding) {
      el.__tooltip = new Tooltip(el, binding.value || text)
    },
    unmounted(el) {
      el.__tooltip?.destroy()
    }
  }
}

const functionalDirectives = {
  highlight: createHighlightDirective('#fff3cd'),
  highlightBlue: createHighlightDirective('#cce5ff'),
  tooltip: createTooltipDirective('Default tip')
}

Object.entries(functionalDirectives).forEach(([name, def]) => {
  app.directive(name, def)
})
```

### 4.2 批量注册 + 配置对象

```js
// 配置驱动的批量注册
const directiveConfigs = [
  { name: 'focus', type: 'functional', fn: el => el.focus() },
  { name: 'highlight', type: 'functional', fn: (el, b) => el.style.background = b.value },
  { name: 'debounce', type: 'object', hooks: { mounted: /* ... */ } },
  { name: 'permissions', type: 'object', hooks: { mounted: /* ... */ } }
]

directiveConfigs.forEach(({ name, fn, hooks }) => {
  app.directive(name, hooks || fn)
})
```

---

## 五、实战场景

### 场景一：表单批量处理指令

```html
<script setup>
const formBatch = {
  focus: true,
  highlight: '#e8f4fd',
  validate: true
}
</script>

<template>
  <form>
    <input v-bind="formBatch" v-model="form.name" placeholder="姓名" />
    <input v-bind="formBatch" v-model="form.email" placeholder="邮箱" />
    <input v-bind="formBatch" v-model="form.phone" placeholder="电话" />
    <textarea v-bind="formBatch" v-model="form.note" placeholder="备注" />
  </form>
</template>
```

### 场景二：权限指令批量控制

```js
// 权限配置
const permissionDirectives = {
  permissions: {
    mounted(el, binding) {
      const [entity, action] = binding.value.split(':')
      if (!checkPermission(entity, action)) {
        el.style.display = 'none'
        el.style.pointerEvents = 'none'
      }
    }
  }
}

// 批量注册
Object.entries(permissionDirectives).forEach(([name, def]) => {
  app.directive(name, def)
})
```

```html
<div v-permissions="'user:read'">查看用户</div>
<div v-permissions="'user:write'">编辑用户</div>
<div v-permissions="'user:delete'">删除用户</div>
<div v-permissions="'admin:all'">管理面板</div>
```

### 场景三：列表元素批量指令

```html
<script setup>
const listItemDirectives = {
  lazyRender: true,
  enterAnimation: { name: 'fade-in', duration: 300 }
}
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id" v-bind="listItemDirectives">
      {{ item.name }}
    </li>
  </ul>
</template>
```

---

## 六、最佳实践

| 实践 | 说明 |
|------|------|
| **全局注册通用指令** | `focus`、`highlight`、`tooltip` 等高频指令全局注册一次 |
| **局部注册业务指令** | `permissions`、`auditLog` 等业务相关指令局部注册 |
| **插件封装批量注册** | 使用 `app.use(plugin)` 一次性注册多个相关指令 |
| **配置驱动** | 大量指令时使用配置数组 + 循环注册 |
| **v-bind 用于无参数指令** | `v-bind="batch"` 仅适合无 arg 的指令 |
| **避免指令过度滥用** | 复杂逻辑优先考虑组件而非指令 |
| **指令版本兼容** | Vue 2 有 5 个钩子，Vue 3 有 7 个（对齐组件生命周期）|

---

## 七、Vue 2 vs Vue 3 对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 钩子数量 | 5 个（`bind`, `inserted`, `update`, `componentUpdated`, `unbind`）| 7 个（`created`, `beforeMount`, `mounted`, `beforeUpdate`, `updated`, `beforeUnmount`, `unmounted`）|
| 函数式简写 | ❌ | ✅ |
| SSR 支持 | ❌ | ✅（`getSSRProps`）|
| 批量注册 | 手动循环 | 手动循环或插件 |
| v-bind 批量绑定 | ✅ | ✅ |

> Vue 3 中 `bind` → `beforeMount`，`inserted` → `mounted`，`update` → `beforeUpdate` + `updated`，`unbind` → `beforeUnmount` + `unmounted`。

---

## 参考资料

- [Vue 3 自定义指令](https://vuejs.org/guide/reusability/custom-directives.html)
- [Vue 2 自定义指令](https://v2.vuejs.org/v2/guide/custom-directive.html)
- [Vue 3 指令 Composition API](https://vuejs.org/api/built-in-directives.html#v-bind)
