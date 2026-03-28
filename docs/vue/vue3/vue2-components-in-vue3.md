---
title: Vue2 组件在 Vue3 中使用
category: Vue3 迁移
description: 详解如何通过 @vue/compat 将 Vue2 组件迁移到 Vue3 中使用
keywords: Vue2, Vue3, @vue/compat, 迁移, 组件复用
---

# Vue2 组件在 Vue3 中使用

## 1. 核心方案：@vue/compat

@vue/compat（又称 Migration Build）是 Vue3 提供的一个特殊构建版本，它将 Vue3 伪装成 Vue2 的行为模式，使大多数 Vue2 的公共 API 可以像 Vue2 一样运行，同时在 Vue3 模式下运行。

### 1.1 工作原理

```
Vue 3 + @vue/compat
        ↓
  兼容 Vue 2 行为
        ↓
  Vue 2 组件可运行
```

### 1.2 适用场景

- 升级 Vue2 应用到 Vue3（有已知限制）
- 迁移库以支持 Vue3
- Vue2 开发者学习 Vue3 差异

### 1.3 已知限制

**无法使用的情况：**
- 依赖 Vue2 内部 API 或未文档化行为的第三方库
  - 如 Vuetify、Quasar、ElementUI（需等待官方 Vue3 版本）
- 需要 IE11 支持（Vue3 已放弃 IE11）
- 自定义 SSR 设置迁移复杂（建议使用 Nuxt3）

**注意：**
- 仅覆盖文档化的 Vue2 API 和行为
- 依赖未文档化行为的应用无法迁移

## 2. 安装配置

### 2.1 安装依赖

```json
{
  "dependencies": {
-   "vue": "^2.6.12",
+   "vue": "^3.1.0",
+   "@vue/compat": "^3.1.0"
  },
  "devDependencies": {
-   "vue-template-compiler": "^2.6.12"
+   "@vue/compiler-sfc": "^3.1.0"
  }
}
```

### 2.2 Webpack 配置

```javascript
// vue.config.js
module.exports = {
  chainWebpack: (config) => {
    // 将 vue 别名指向 @vue/compat
    config.resolve.alias.set('vue', '@vue/compat')

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2  // 启用 Vue2 兼容模式
            }
          }
        }
      })
  }
}
```

### 2.3 Vite 配置

```javascript
// vite.config.js
import vue from '@vitejs/plugin-vue'

export default {
  resolve: {
    alias: {
      vue: '@vue/compat'
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2
          }
        }
      }
    })
  ]
}
```

### 2.4 TypeScript 配置

创建 `vue-shim.d.ts`：

```typescript
declare module 'vue' {
  import { CompatVue } from '@vue/runtime-dom'
  const Vue: CompatVue
  export default Vue
  export * from '@vue/runtime-dom'
  const { configureCompat } = Vue
  export { configureCompat }
}
```

## 3. Vue2 组件示例

### 3.1 Options API 组件

Vue2 的 Options API 组件可直接使用：

```vue
<!-- MyButton.vue -->
<template>
  <button class="my-button" @click="handleClick">
    <slot>{{ text }}</slot>
  </button>
</template>

<script>
export default {
  name: 'MyButton',
  props: {
    text: {
      type: String,
      default: 'Click'
    }
  },
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.my-button {
  padding: 8px 16px;
  border-radius: 4px;
  background: #409eff;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
```

在 Vue3 中使用：

```vue
<template>
  <MyButton @click="onClick">确认</MyButton>
</template>

<script setup>
import MyButton from './MyButton.vue'

const onClick = () => {
  console.log('按钮点击')
}
</script>
```

### 3.2 事件总线迁移

Vue2 的 `$on`/`$emit` 在 @vue/compat 模式下可用，但推荐使用 Vue3 的新方式：

```javascript
// Vue2 方式（兼容模式可用）
this.$emit('update', value)
this.$on('update', handler)

// Vue3 推荐方式
// 父组件
<ChildComponent @update="handler" />

// 子组件
import { defineEmits } from 'vue'
const emit = defineEmits(['update'])
emit('update', value)
```

### 3.3 Filters 迁移

Vue2 Filters 在 @vue/compat 中仍可用，但 Vue3 推荐使用 methods 或 computed：

```vue
<!-- Vue2 Filter 方式 -->
<template>
  <span>{{ name | capitalize }}</span>
</template>

<script>
export default {
  filters: {
    capitalize(value) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
}
</script>
```

```vue
<!-- Vue3 推荐方式 -->
<template>
  <span>{{ capitalize(name) }}</span>
</template>

<script setup>
const capitalize = (value) => 
  value.charAt(0).toUpperCase() + value.slice(1)
</script>
```

### 3.4 $children 和 $refs

```javascript
// Vue2 方式
this.$children[0].doSomething()
this.$refs.myComponent.doSomething()

// Vue3 方式
// 需要通过 ref 和 defineExpose 暴露方法
import { ref } from 'vue'

const childRef = ref(null)

// 模板中
<ChildComponent ref="childRef" />

// 访问
childRef.value.doSomething()
```

## 4. 渐进式迁移策略

### 4.1 阶段一：运行在 Migration Build

1. 安装 @vue/compat
2. 配置别名
3. 验证所有组件正常运行
4. 观察运行时警告

### 4.2 阶段二：修复警告

常见警告及修复：

| 警告 | 原因 | 修复方式 |
|------|------|----------|
| `$on`, `$off` 被移除 | 事件总线已移除 | 使用 mitt 或 Vue3 事件系统 |
| `filters` 被移除 | 过滤器语法被移除 | 改用 methods/computed |
| `$children` 被移除 | 组件树 API 移除 | 使用模板 ref |
| `v-model` 行为变化 | v-model 语法改变 | 适配新语法 |

### 4.3 阶段三：切换到 Vue3 模式

```javascript
// 单个组件切换到 Vue3 模式
compilerOptions: {
  compatConfig: {
    MODE: 3  // 该组件使用 Vue3 行为
  }
}
```

### 4.4 阶段四：移除兼容层

- 删除 @vue/compat
- 恢复 vue 别名
- 使用标准 Vue3 API

## 5. 第三方组件库处理

| 组件库 | Vue3 支持 | 建议 |
|--------|-----------|------|
| Vuetify | 需等 Vuetify 3 | 使用 Vuetify 3 测试版 |
| ElementUI | 有 Element Plus | 迁移到 Element Plus |
| Ant Design Vue | 已有 Vue3 版本 | 升级到 Ant Design Vue 3.x |
| Quasar | 需等 Quasar 2.0 | 使用 Quasar 2.0 |

## 6. 最佳实践

1. **不要完全依赖 Migration Build**
   - Migration Build 是过渡方案，未来会被移除
   - 应尽快迁移到标准 Vue3 API

2. **组件级别渐进迁移**
   - 优先迁移公共组件
   - 保持业务页面稍后迁移

3. **保持 API 兼容性**
   - 使用 Vue3 新 API 但保持参数兼容
   - 便于后续切换

4. **测试覆盖**
   - 确保迁移后功能完整
   - 重点测试边界情况

## 7. 参考资源

- [Vue3 Migration Build 官方文档](https://v3-migration.vuejs.org/migration-build.html)
- [@vue/compat GitHub](https://github.com/vuejs/core/tree/main/packages/compat)
- [Vue3 迁移指南](https://v3-migration.vuejs.org/)

---

*文档创建时间：2026-03-28*
