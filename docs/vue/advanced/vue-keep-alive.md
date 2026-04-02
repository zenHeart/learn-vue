# Vue keep-alive 深入理解

> keep-alive 是 Vue 内置的抽象组件，用于缓存动态组件或路由组件，避免重复销毁和创建，提升应用性能。

## 目录

1. [核心概念](#1-核心概念)
2. [基本用法](#2-基本用法)
3. [生命周期](#3-生命周期)
4. [include/exclude](#4-includeexclude)
5. [max 缓存限制](#5-max-缓存限制)
6. [与 Vue Router 配合](#6-与-vue-router-配合)
7. [组件更新行为](#7-组件更新行为)
8. [常见场景](#8-常见场景)
9. [性能注意事项](#9-性能注意事项)

---

## 1. 核心概念

### 什么是 keep-alive？

`keep-alive` 是 Vue 的**内置组件**，用于缓存已渲染的组件实例，避免每次切换时都执行销毁和重新创建。

### 工作原理

```
切换前: ComponentA (已挂载)
        ↓ 切换到 ComponentB
缓存: ComponentA 实例保存在内存
        ↓ 切换回 ComponentA
恢复: 从缓存恢复，无需重新创建
```

### 缓存 vs 不缓存对比

| 行为 | 无 keep-alive | 有 keep-alive |
|------|---------------|---------------|
| 首次渲染 | created → mounted | created → mounted |
| 切换离开 | beforeUnmount → unmounted | deactivated（仅停用） |
| 切换回来 | created → mounted | activated（仅激活） |
| 状态保留 | 丢失 | 保留 |

---

## 2. 基本用法

### 缓存单个组件

```html
<template>
  <keep-alive>
    <ComponentA />
  </keep-alive>
</template>
```

### 缓存多个动态组件

```html
<template>
  <keep-alive>
    <component :is="currentComponent" />
  </keep-alive>
</template>

<script setup>
import { ref } from 'vue'
import Home from './Home.vue'
import About from './About.vue'

const currentComponent = ref('Home')
</script>
```

### 缓存路由组件

```html
<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

---

## 3. 生命周期

### activated / deactivated

当组件被激活（从缓存恢复）或停用（放入缓存）时，会触发特定的生命周期钩子：

```js
export default {
  // 组件首次挂载
  created() {
    console.log('created')
  },
  
  // 从缓存恢复（每次激活时调用）
  activated() {
    console.log('activated - 从缓存恢复')
    // 适合：重新获取数据、重启定时器
    this.startTimer()
  },
  
  // 被停用（放入缓存前调用）
  deactivated() {
    console.log('deactivated - 即将缓存')
    // 适合：暂停定时器、保存状态
    this.stopTimer()
  },
  
  // 组件真正销毁
  beforeUnmount() {
    console.log('beforeUnmount - 真正销毁')
  }
}
```

### 执行顺序图

```
首次挂载:
created → mounted

切换离开 (keep-alive):
deactivated

切换回来 (keep-alive):
activated

真正销毁 (移除 keep-alive 或被 exclude):
beforeUnmount → unmounted
```

---

## 4. include/exclude

### 使用字符串（逗号分隔）

```html
<!-- 缓存名称为 Home 和 About 的组件 -->
<keep-alive include="Home,About">
  <component :is="currentComponent" />
</keep-alive>
```

### 使用正则

```html
<keep-alive :include="/Home|About/">
  <component :is="currentComponent" />
</keep-alive>
```

### 使用数组

```html
<keep-alive :include="['Home', 'About', 'UserList']">
  <component :is="currentComponent" />
</keep-alive>
```

### exclude（排除）

```html
<!-- 缓存除了 User 以外的所有组件 -->
<keep-alive exclude="User">
  <component :is="currentComponent" />
</keep-alive>
```

### 组件名称设置

**选项式 API：**
```js
export default {
  name: 'HomePage',
  // keep-alive 会根据 name 匹配
}
```

**组合式 API（需手动定义 name）：**
```js
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomePage', // 必须定义 name 才能被 keep-alive 识别
  setup() { /* ... */ }
})
```

**函数式组件（无状态）：**
```js
// 函数式组件默认没有 name，需要包装
const HomePage = {
  name: 'HomePage',
  functional: true,
  render(h, ctx) {
    return h('div', ctx.slots().default)
  }
}
```

---

## 5. max 缓存限制

### 设置最大缓存数

```html
<!-- 最多缓存 10 个组件实例 -->
<keep-alive :max="10">
  <component :is="currentComponent" />
</keep-alive>
```

### LRU 策略

当缓存数量超过 `max` 时，Vue 会**移除最久未激活**的组件实例：

```
缓存顺序: [A, B, C, D] (max=4)
         ↓ 访问 E
缓存顺序: [B, C, D, E] (A 被移除)
         ↓ 访问 B
缓存顺序: [C, D, E, B] (B 移到最新)
```

### 结合 include 精确控制

```html
<!-- 缓存列表中最多保留 5 个 -->
<keep-alive :include="cachedComponents" :max="5">
  <component :is="currentComponent" />
</keep-alive>
```

```js
import { ref } from 'vue'

const cachedComponents = ref(['Home', 'About', 'User', 'Settings'])
```

---

## 6. 与 Vue Router 配合

### 方式一：router-view 直接配合

```html
<router-view v-slot="{ Component, route }">
  <keep-alive :include="keepAliveComponents">
    <component :is="Component" :key="route.path" />
  </keep-alive>
</router-view>
```

### 方式二：缓存特定路由

```html
<router-view v-slot="{ Component, route }">
  <keep-alive :include="route.meta.keepAlive ? ['default'] : []">
    <component :is="Component" :key="route.path" />
  </keep-alive>
</router-view>
```

### 路由 meta 配置

```js
{
  path: '/user',
  component: User,
  meta: { keepAlive: true }
},
{
  path: '/about',
  component: About,
  meta: { keepAlive: false } // 不缓存
}
```

### 嵌套路由缓存

```html
<!-- 父路由使用 keep-alive -->
<keep-alive>
  <router-view />
</keep-alive>
```

```js
// 子路由
{
  path: '/user/:id',
  component: UserLayout,
  children: [
    { path: 'profile', component: Profile },
    { path: 'posts', component: Posts }
  ]
}
```

---

## 7. 组件更新行为

### 缓存组件如何响应数据更新？

```html
<keep-alive>
  <UserList :key="filter" />
</keep-alive>
```

```js
// UserList 组件
export default {
  props: ['filter'],
  
  // 监听 prop 变化，重新获取数据
  watch: {
    filter: {
      handler(newFilter) {
        this.fetchUsers(newFilter)
      },
      immediate: true
    }
  },
  
  activated() {
    // 每次从缓存恢复时调用，适合刷新数据
    if (this.needsRefresh) {
      this.fetchUsers(this.filter)
    }
  }
}
```

### 强制刷新缓存组件

```html
<!-- 通过改变 :include 动态控制 -->
<keep-alive :include="activeComponents">
  <component :is="currentComponent" />
</keep-alive>
```

```js
// 清除特定组件缓存
function refreshComponent(componentName) {
  const idx = activeComponents.value.indexOf(componentName)
  if (idx > -1) {
    activeComponents.value.splice(idx, 1)
    // 强制重新渲染后再加回来
    nextTick(() => {
      activeComponents.value.push(componentName)
    })
  }
}
```

### beforeRouteLeave + keep-alive

```js
export default {
  beforeRouteLeave(to, from, next) {
    // 如果组件被 keep-alive，deactivated 会代替 beforeRouteLeave
    // 离开页面时真正销毁
    this.$options.name // 有 name 才有效
    next()
  }
}
```

---

## 8. 常见场景

### 8.1 列表页 → 详情页 → 返回列表

```
列表页 (List) ──点击──→ 详情页 (Detail)
    ↑                              │
    └────── 返回（保留列表状态）─────┘
```

```html
<!-- 缓存列表页 -->
<keep-alive include="ProductList">
  <router-view />
</keep-alive>
```

```js
// ProductList.vue
activated() {
  // 从详情页返回时，可选刷新或保持状态
  if (this.needsReload) {
    this.fetchProducts()
  }
}
```

### 8.2 Tab 切换

```html
<div class="tabs">
  <button 
    v-for="tab in tabs" 
    :key="tab"
    :class="{ active: currentTab === tab }"
    @click="currentTab = tab"
  >
    {{ tab }}
  </button>
</div>

<keep-alive :include="tabs">
  <component :is="currentTabComponent" />
</keep-alive>
```

### 8.3 表单草稿保存

```js
export default {
  deactivated() {
    // 保存表单草稿
    localStorage.setItem('form-draft', JSON.stringify(this.formData))
  },
  
  activated() {
    // 恢复草稿
    const draft = localStorage.getItem('form-draft')
    if (draft) {
      this.formData = JSON.parse(draft)
    }
  }
}
```

---

## 9. 性能注意事项

### 内存占用

| 场景 | 建议 |
|------|------|
| 大量组件 | 设置 `max` 限制 |
| 大型组件 | 谨慎缓存，考虑只缓存数据 |
| 内存敏感 | 监控内存使用 |

### 定时器处理

```js
export default {
  data() {
    return { timer: null }
  },
  
  activated() {
    // 激活时重启定时器
    this.timer = setInterval(() => {
      this.update()
    }, 1000)
  },
  
  deactivated() {
    // 停用时清除定时器，避免内存泄漏
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
```

### 避免缓存过多组件

```html
<!-- 不好：无限缓存 -->
<keep-alive>
  <component :is="currentView" />
</keep-alive>

<!-- 好：限制缓存数量 -->
<keep-alive :max="10">
  <component :is="currentView" />
</keep-alive>
```

---

## 参考资料

- [Vue 官方文档 - keep-alive](https://vuejs.org/api/built-in-components.html#keep-alive)
- [Vue Router + keep-alive 最佳实践](https://router.vuejs.org/guide/advanced/lazy-loading.html#lazy-loading-routes)
