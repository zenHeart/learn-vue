# Vue Router 完整指南

> 本文档系统梳理 Vue Router 的核心概念、配置选项、导航守卫和高级用法，适用于 Vue 3 环境。

## 目录

1. [基础概念](#1-基础概念)
2. [路由配置](#2-路由配置)
3. [动态路由与参数](#3-动态路由与参数)
4. [嵌套路由](#4-嵌套路由)
5. [编程式导航](#5-编程式导航)
6. [导航守卫](#6-导航守卫)
7. [路由元信息](#7-路由元信息)
8. [滚动行为](#8-滚动行为)
9. [路由懒加载](#9-路由懒加载)
10. [高级用法](#10-高级用法)

---

## 1. 基础概念

Vue Router 是 Vue.js 官方路由管理器，用于构建单页面应用（SPA）。

### 核心组件

| 组件 | 说明 |
|------|------|
| `<router-link>` | 声明式导航，生成 `<a>` 标签 |
| `<router-view>` | 路由出口，渲染匹配组件 |

### 基本使用

```js
// main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// 1. 定义路由组件
const Home = { template: '<div>Home</div>' }
const About = { template: '<div>About</div>' }

// 2. 定义路由规则
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

// 3. 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 4. 挂载到 Vue 实例
const app = createApp(App)
app.use(router)
app.mount('#app')
```

```html
<!-- App.vue -->
<template>
  <nav>
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
  </nav>
  <router-view />
</template>
```

### 路由模式

| 模式 | API | URL 格式 | 说明 |
|------|-----|----------|------|
| History | `createWebHistory()` | `/home` | 需服务器配置，支持 HTML5 History API |
| Hash | `createWebHashHistory()` | `/#/home` | 无需服务器配置，兼容性好 |
| Memory | `createMemoryHistory()` | 无 URL | 用于 SSR/非浏览器环境 |

```js
import { createWebHistory, createWebHashHistory } from 'vue-router'

// HTML5 History 模式（推荐）
const router = createRouter({
  history: createWebHistory('/app'),
  routes
})

// Hash 模式
const router = createRouter({
  history: createWebHashHistory(),
  routes
})
```

---

## 2. 路由配置

### 基础配置

```js
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Home.vue'),
      // 路由独享守卫
      beforeEnter: (to, from) => {
        // ...
      }
    }
  ],
  // 路由行为配置
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
  parseQuery: query => {},
  stringifyQuery: query => {}
})
```

### 路由记录（Route Record）属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `path` | string | 路由路径（必填） |
| `name` | string | 路由名称（唯一） |
| `component` | Component | 路由组件 |
| `components` | Record<string, Component> | 命名视图组件 |
| `redirect` | string/Location/Function | 重定向 |
| `props` | boolean/object/function | 路由参数传递给组件 |
| `alias` | string/array | 路径别名 |
| `children` | array | 嵌套路由 |
| `beforeEnter` | function | 路由独享守卫 |
| `meta` | object | 路由元信息 |

### 路由命名视图

```html
<template>
  <router-view name="header" />
  <main>
    <router-view />
  </main>
  <router-view name="footer" />
</template>
```

```js
{
  path: '/',
  components: {
    default: Home,
    header: Header,
    footer: Footer
  }
}
```

---

## 3. 动态路由与参数

### 路由参数

```js
// 定义动态路由
const routes = [
  { path: '/user/:id', component: User },
  { path: '/article/:category/:id', component: Article }
]
```

### 在组件中获取参数

```html
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// 获取参数
console.log(route.params.id)

// 获取查询参数
console.log(route.query.name)

// 获取 hash
console.log(route.hash)
</script>
```

### 路由 props 解耦

```js
// 方式一：布尔值（将 params 作为 props 传递）
{ path: '/user/:id', component: User, props: true }

// 方式二：对象（静态 props）
{ path: '/user', component: User, props: { id: 123 } }

// 方式三：函数
{ 
  path: '/user/:id', 
  component: User, 
  props: route => ({ id: route.params.id, name: route.query.name })
}
```

### 监听路由变化

```js
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 监听参数变化
watch(() => route.params.id, (newId, oldId) => {
  console.log(`ID changed: ${oldId} -> ${newId}`)
  // 重新获取数据
})
```

### beforeRouteUpdate 守卫

```js
export default {
  beforeRouteUpdate(to, from) {
    // 路由参数变化时自动调用
    this.fetchUser(to.params.id)
  }
}
```

---

## 4. 嵌套路由

```js
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      // /user/:id/profile
      { path: 'profile', component: UserProfile },
      // /user/:id/posts
      { path: 'posts', component: UserPosts }
    ]
  }
]
```

```html
<!-- User.vue -->
<template>
  <div class="user">
    <h2>User {{ route.params.id }}</h2>
    <!-- 子路由出口 -->
    <router-view />
  </div>
</template>
```

> 注意：子路由 path 以 `/` 开头会变成绝对路径，否则是相对路径。

---

## 5. 编程式导航

### 导航方法

| 方法 | 说明 |
|------|------|
| `router.push(path)` | 导航到指定路径 |
| `router.replace(path)` | 替换当前记录 |
| `router.go(n)` | 历史记录中前进/后退 |
| `router.back()` | 后退一页 |
| `router.forward()` | 前进一步 |

### push vs replace

```js
// 导航并添加历史记录（可后退）
router.push('/user/123')
router.push({ path: '/user/123' })
router.push({ name: 'user', params: { id: '123' } })

// 替换当前记录（不可后退）
router.replace('/home')
```

### 带查询参数和 hash

```js
router.push({
  path: '/search',
  query: { q: 'vue' },
  hash: '#results'
})
// → /search?q=vue#results
```

### Promise 支持

```js
router.push('/user/123')
  .then(() => {
    // 导航成功
  })
  .catch(err => {
    if (err.name === 'NavigationDuplicated') {
      // 重复导航
    }
  })
```

---

## 6. 导航守卫

### 守卫类型

| 守卫 | 说明 | 调用时机 |
|------|------|----------|
| `beforeEach` | 全局前置 | 路由切换**前** |
| `beforeResolve` | 全局解析 | 导航被确认**前**，组件解析**后** |
| `afterEach` | 全局后置 | 导航**后**（不能取消） |
| `beforeEnter` | 路由独享 | 仅针对该路由 |
| `beforeRouteEnter` | 组件内 | 渲染组件**前** |
| `beforeRouteUpdate` | 组件内 | 路由参数变化**后** |
| `beforeRouteLeave` | 组件内 | 离开路由**前** |

### 守卫参数

```js
// to: 目标路由对象
// from: 当前路由对象
// next: 解析导航的回调

router.beforeEach((to, from, next) => {
  // 检查认证
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

### next 函数行为

| 调用 | 行为 |
|------|------|
| `next()` | 确认导航 |
| `next(false)` | 中止导航 |
| `next('/')` | 重定向到其他位置 |
| `next(error)` | 抛出错误 |

> ⚠️ `next()` 必须调用，否则导航不会进行！

### 全局守卫示例

```js
// main.js
router.beforeEach((to, from, next) => {
  // 记录页面访问
  console.log(`Navigating to: ${to.path}`)
  
  // 检查认证
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

router.beforeResolve((to, from) => {
  // 组件解析完成后调用
  console.log('Route resolved:', to.path)
})

router.afterEach((to, from) => {
  // 常用于滚动到顶部、页面标题更新
  document.title = to.meta.title || 'Default Title'
})
```

### 组件内守卫

```js
export default {
  beforeRouteEnter(to, from, next) {
    // 此时组件实例不可访问
    next(vm => {
      // vm 是组件实例
      vm.fetchData()
    })
  },
  
  beforeRouteUpdate(to, from, next) {
    // 路由参数变化时调用
    this.fetchData(to.params.id)
    next()
  },
  
  beforeRouteLeave(to, from, next) {
    // 离开确认
    if (this.hasUnsavedChanges) {
      const answer = confirm('有未保存的更改，确定离开吗？')
      if (answer) next()
      else next(false)
    } else {
      next()
    }
  }
}
```

### 守卫执行顺序

```
1. 触发导航
2. beforeRouteLeave (组件A)
3. beforeEach (全局)
4. beforeRouteUpdate (组件A，参数变化时)
5. beforeEnter (路由独享)
6. 解析组件
7. beforeRouteEnter (组件B)
8. beforeResolve (全局)
9. 导航确认
10. afterEach (全局)
```

---

## 7. 路由元信息

### 定义 meta

```js
{
  path: '/admin',
  component: Admin,
  meta: {
    requiresAuth: true,
    role: 'admin',
    title: '管理后台'
  }
}
```

### 访问 meta

```js
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    checkAuth().then(isAuth => {
      if (isAuth) next()
      else next('/login')
    })
  } else {
    next()
  }
})
```

---

## 8. 滚动行为

```js
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    // 1. 返回 savedPosition（按浏览器后退/前进按钮时）
    if (savedPosition) {
      return savedPosition
    }
    
    // 2. 滚动到锚点
    if (to.hash) {
      return { el: to.hash }
    }
    
    // 3. 滚动到顶部
    return { top: 0 }
  }
})
```

### 异步滚动

```js
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ top: 0 })
      }, 500)
    })
  }
})
```

---

## 9. 路由懒加载

### 动态导入

```js
// 方式一：动态导入（推荐）
const User = () => import('./views/User.vue')

// 方式二：带名称的动态导入（webpack）
const User = () => import(/* webpackChunkName: "user" */ './views/User.vue')

// 方式三：多个路由共享 chunk
const UserProfile = () => import(/* webpackChunkName: "user" */ './views/UserProfile.vue')
const UserPosts = () => import(/* webpackChunkName: "user" */ './views/UserPosts.vue')
```

---

## 10. 高级用法

### 10.1 路由别名

```js
{
  path: '/home',
  component: Home,
  alias: ['/index', '/main']
}
```

### 10.2 路由重定向

```js
// 绝对重定向
{ path: '/', redirect: '/home' }

// 命名路由重定向
{ path: '/home', redirect: { name: 'home' } }

// 函数重定向
{ 
  path: '/old-:id', 
  redirect: to => `/new-${to.params.id}` 
}
```

### 10.3 可选参数

```js
// :id? 表示可选参数
{ path: '/user/:id?', component: User }
```

### 10.4 正则匹配

```js
// 仅匹配数字
{ path: '/order/:id(\\d+)', component: Order }

// 可选参数段
{ path: '/article/:chapters+', component: Article }
{ path: '/user/:id(\\d+)?', component: User }
```

### 10.5 RouterLink 高级用法

```html
<!-- 激活类名 -->
<router-link to="/about" active-class="active">About</router-link>
<router-link to="/about" exact-active-class="exact-active">About</router-link>

<!-- 替换历史记录 -->
<router-link to="/home" replace>Home</router-link>

<!-- 事件处理 -->
<router-link to="/about" @click.prevent="handleClick">About</router-link>

<!-- 自定义渲染 -->
<router-link to="/about" custom>
  <button>Go to About</button>
</router-link>
```

### 10.6 History 模式服务器配置

**nginx:**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**

```apache
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## 常见问题

### Q: 如何获取当前路由？

```js
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
```

### Q: 如何阻止用户离开当前页面？

```js
beforeRouteLeave(to, from, next) {
  const answer = window.confirm('确定要离开吗？')
  if (answer) next()
  else next(false)
}
```

### Q: 路由懒加载 vs 同步加载？

```js
// 同步（立即加载）
import User from './views/User.vue'

// 懒加载（按需加载）
const User = () => import('./views/User.vue')
```

---

## 参考资料

- [Vue Router 官方文档](https://router.vuejs.org/)
- [Vue Router GitHub](https://github.com/vuejs/router)
