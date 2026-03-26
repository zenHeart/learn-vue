# Vue 3 Migration Build 完全指南

> 本文档介绍如何使用 Vue 3 Migration Build（@vue/compat）从 Vue 2 平滑迁移到 Vue 3。

## 目录

1. [概述](#概述)
2. [核心概念](#核心概念)
3. [快速开始](#快速开始)
4. [迁移步骤](#迁移步骤)
5. [配置详解](#配置详解)
6. [常见问题](#常见问题)

---

## 概述

### 什么是 Migration Build

Vue 3 提供了一个特殊的迁移构建版本（Migration Build，也称为 `@vue/compat` 或"the migration build"），它在 Vue 3 上提供可配置的 Vue 2 兼容行为：

| 特性 | 说明 |
|------|------|
| **默认 Vue 2 模式** | 大多数公共 API 行为与 Vue 2 完全一致 |
| **运行时警告** | 变更/废弃功能会发出运行时警告，帮助你识别需要迁移的代码 |
| **逐特性配置** | 每个特性的兼容行为都可以单独开启/关闭 |

### 为什么使用 Migration Build

```
Vue 2 项目
    ↓
使用 Migration Build（@vue/compat）
    ↓
应用运行 + 运行时警告
    ↓
逐个处理警告
    ↓
关闭兼容层
    ↓
纯 Vue 3
```

### @vue/compat vs vue

| 包 | 说明 |
|----|------|
| `vue` | 纯 Vue 3，无兼容性代码 |
| `@vue/compat` | Vue 3 + Vue 2 兼容层，体积更大 |

---

## 核心概念

### 兼容层的工作原理

```javascript
// @vue/compat 内部做了这些事情：
import Vue from 'vue'  // 实际上指向 @vue/compat

// Vue 2 API 自动映射到 Vue 3
Vue.filter('myFilter', fn)  // → Vue 3 中自动注册为全局 mixin
Vue.component('myComp', {})  // → 自动调用 app.component()
vm.$watch()  // → 自动映射到 Vue 3 的 watch()
```

### 三种兼容模式

| 模式 | 配置值 | 行为 |
|------|--------|------|
| **Vue 2 模式** | `'vue2'` | 完全模拟 Vue 2 行为（默认） |
| **Vue 3 模式** | `'vue3'` | 完全使用 Vue 3 行为 |
| **配置模式** | `'conf'` | 每个特性单独配置 |

---

## 快速开始

### 安装

```bash
npm install vue@3 @vue/compat@3 --save
# 或
yarn add vue@3 @vue/compat@3
```

### Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compatConfig: {
          // 全局兼容配置
          MODE: 2  // 2 = Vue 2 模式
        }
      }
    })
  ],
  resolve: {
    alias: {
      // 将 vue 指向 @vue/compat
      'vue': '@vue/compat'
    }
  }
})
```

### Vue CLI / Webpack 配置

```javascript
// vue.config.js (Vue CLI)
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm-bundler.js'
      }
    }
  }
}
```

---

## 迁移步骤

### 步骤一：评估现状

```bash
# 1. 安装 @vue/compat
npm install @vue/compat@3 --save

# 2. 配置别名
# vite: resolve.alias
# webpack: resolve.alias

# 3. 启动应用，记录所有警告
npm run dev
```

### 步骤二：处理全局 API 更新

Vue 2 → Vue 3 全局 API 变化：

| Vue 2 | Vue 3 |
|-------|-------|
| `Vue.extend()` | `defineComponent()` 或 `setup()` |
| `Vue.filter()` | 已移除，需使用 `app.filter()` 或替代方案 |
| `Vue.mixin()` | 已移除，需使用 composable 或 plugin |
| `Vue.directive()` | `app.directive()` |
| `Vue.component()` | `app.component()` |
| `Vue.use()` | `app.use()` |
| `Vue.prototype` | `app.config.globalProperties` |
| `Vue.config.productionTip` | 已移除 |

```javascript
// Vue 2
Vue.filter('capitalize', v => v.charAt(0).toUpperCase() + v.slice(1))

// Vue 3 + @vue/compat（运行时警告）
app.config.globalProperties.$filters = {
  capitalize: v => v.charAt(0).toUpperCase() + v.slice(1)
}

// 推荐：使用全局方法代替 filter
```

### 步骤三：处理选项 API 到组合式 API

```javascript
// Vue 2 选项式
export default {
  data() { return { count: 0 } },
  computed: {
    double() { return this.count * 2 }
  },
  methods: {
    increment() { this.count++ }
  }
}

// Vue 3 组合式（推荐迁移目标）
import { ref, computed } from 'vue'
export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    const increment = () => count.value++
    return { count, double, increment }
  }
}
```

### 步骤四：处理已移除的 API

| 已移除 | 替代方案 |
|--------|----------|
| `v-bind.sync` | `v-model` 参数 |
| `keyCode 修饰符` | `event.key` |
| `$listeners` | 合并到 `$attrs` |
| `slot-scope` | `v-slot` |
| `filters` | 方法或计算属性 |
| `$children` | 使用 ref 或 pinia |
| `beforeDestroy` | `beforeUnmount` |
| `destroyed` | `unmounted` |

### 步骤五：关闭兼容层

当所有警告都处理完毕后：

```javascript
// vite.config.js
export default defineConfig({
  plugins: [
    vue({
      template: {
        compatConfig: {
          MODE: 3  // 切换到 Vue 3 模式
          // 或逐特性配置：
          // FEATURE_OPTIONS_API: false,
          // FEATURE_TELEPORT: false
        }
      }
    })
  ]
})
```

---

## 配置详解

### lerna.json 中的 Migration Build

如果使用 Lerna monorepo：

```json
{
  "packages": ["packages/*"],
  "version": "independent",
  "command": {
    "publish": {
      "ignoreChanges": ["*.md"]
    }
  }
}
```

### 逐特性兼容配置

```javascript
// vite.config.js
export default defineConfig({
  plugins: [
    vue({
      template: {
        compatConfig: {
          // Vue 2 模式（默认）
          MODE: 2,
          
          // 逐特性配置
          INSTANCE_EVENT_EMITTER: false,  // 关闭 $emit 兼容
          INSTANCE_CONTAINER_UNMOUNTED: false,  // 关闭 mounted 警告
          FEATURE_OPTIONS_API: false,  // 关闭选项 API
          FEATURE_TELEPORT: false,  // 关闭 Teleport 警告
        }
      }
    })
  ]
})
```

### 兼容性特性列表

| 特性 | 说明 | 默认值 |
|------|------|--------|
| `MODE` | 2 = 全部兼容，3 = 全部 Vue 3 | 2 |
| `INSTANCE_EVENT_EMITTER` | $on/$off/$once | true |
| `INSTANCE_CONTAINER_UNMOUNTED` | mounted 时检查容器已卸载 | true |
| `INSTANCE_SCOPED_SLOTS_INJECTION` | 作用域插槽注入 | true |
| `FEATURE_OPTIONS_API` | 选项 API | true |
| `FEATURE_TELEPORT` | Teleport | true |
| `FEATURE_LIMIT_REACTIVE_TRACKING` | 受限响应式跟踪 | true |

---

## 常见问题

### Q1: Migration Build 会影响性能吗？

**A：** 会。`@vue/compat` 比纯 `vue@3` 体积大约 20-30%。建议仅在迁移阶段使用，迁移完成后切换到纯 Vue 3。

### Q2: filter 完全不能用了吗？

**A：** filter 语法在模板中仍然可以使用（通过兼容层），但建议使用计算属性或方法替代：

```vue
<!-- 不推荐 -->
<template>
  <div>{{ message | capitalize }}</div>
</template>

<!-- 推荐 -->
<template>
  <div>{{ capitalize(message) }}</div>
</template>
<script>
export default {
  methods: {
    capitalize(v) { return v.charAt(0).toUpperCase() + v.slice(1) }
  }
}
</script>
```

### Q3: 如何处理全局状态（Vuex → Pinia）？

```javascript
// Vue 2 + Vuex
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: { count: 0 },
  mutations: { increment(state) { state.count++ } },
  actions: { increment({ commit }) { commit('increment') } }
})

// Vue 3 + Pinia
import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)

// store/counter.js
import { defineStore } from 'pinia'
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: { increment() { this.count++ } }
})
```

### Q4: $listeners 去哪里了？

**A：** 在 Vue 3 中，`$listeners` 已合并到 `$attrs`：

```vue
<!-- Vue 2 -->
<ChildComponent :value="value" @click="onClick" @input="onInput" />
<!-- ChildComponent 中访问 this.$listeners -->

<!-- Vue 3 -->
<ChildComponent :value="value" @click="onClick" @input="onInput" />
<!-- ChildComponent 中直接使用 $attrs，包含所有非 prop 属性和事件 -->
```

### Q5: 如何处理 Vue 2 组件库？

**A：** 大多数主流组件库已有 Vue 3 版本：

| 组件库 | Vue 3 版本 |
|--------|-----------|
| Element UI | Element Plus |
| iView | View UI Plus |
| Ant Design Vue | 已有 Vue 3 支持 |
| Vuetify | Vuetify 3 |

---

## 参考资料

- [Vue 3 Migration Build 官方文档](https://v3-migration.vuejs.org/migration-build.html)
- [Vue 3 迁移指南仓库](https://github.com/vuejs/v3-migration-guide)
- [@vue/compat npm](https://www.npmjs.com/package/@vue/compat)
