---
title: vue-router scrollBehavior 滚动行为
tags: vue, vue-router
birth: 2025-01-01
modified: 2025-01-01
---

# vue-router scrollBehavior 滚动行为

## 概述

`scrollBehavior` 是 Vue Router 提供的配置项，用于控制路由切换时的页面滚动行为。

## scrollBehavior 参数

```js
const router = new VueRouter({
  scrollBehavior(to, from, savedPosition) {
    // to: 目标路由对象
    // from: 当前路由对象  
    // savedPosition: 仅在浏览器前进/后退时可用，记录之前的滚动位置
  }
})
```

## 基本用法

### 1. 切换路由回到顶部

```js
// Vue 2 / Vue 3
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})
```

### 2. 滚动到锚点

```js
scrollBehavior(to, from, savedPosition) {
  if (to.hash) {
    return { el: to.hash }
  }
}
```

## savedPosition 场景

当用户点击浏览器**后退/前进**按钮时，恢复之前的滚动位置：

```js
scrollBehavior(to, from, savedPosition) {
  if (savedPosition) {
    return savedPosition
  }
  return { x: 0, y: 0 }
}
```

> 只有通过 `router-link`、`this.$router.push()` 或 URL 直接访问这三种方式触发路由时，`savedPosition` 才有值。

## 异步滚动（Promise）

可返回 Promise 延迟滚动，常用于等待页面渲染完成后滚动：

```js
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ x: 0, y: 0 })
    }, 500)
  })
}
```

## 与 HTML5 History API 配合

Vue Router 默认使用 `history.pushState`，滚动行为与浏览器原生行为一致：

| 操作 | 滚动行为 |
|------|---------|
| 点击 `router-link` | 由 `scrollBehavior` 控制 |
| 浏览器前进/后退 | 由 `scrollBehavior` + `savedPosition` 控制 |
| 直接访问 URL | 由 `scrollBehavior` 控制 |

> SSR 场景下，`hash` 模式不依赖服务端，滚动行为在客户端处理。

## Vue 2 vs Vue 3 写法对比

```js
// Vue 2
const router = new VueRouter({
  routes: [],
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})

// Vue 3
const router = createRouter({
  routes: [],
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})
```

## 返回值类型

```js
// 回到顶部
{ x: 0, y: 0 }

// 滚动到锚点
{ el: '#anchor' }

// 滚动到元素（DOM 或 selector）
{ top: 100, left: 0 }
```

## 实际应用场景

1. **列表页 → 详情页 → 返回列表**：通过 `savedPosition` 恢复列表滚动位置
2. **长页面锚点导航**：点击锚点平滑滚动到对应位置
3. **异步加载内容**：Promise 延迟确保数据渲染完成后再滚动

## 示例

参看 [vue-router-scroll-behavior](/example-vue3/vue-router-scroll-behavior.html)

