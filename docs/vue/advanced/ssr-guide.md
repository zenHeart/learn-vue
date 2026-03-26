# 搞懂 SSR — Vue 服务端渲染完整指南

> 深入理解 Vue SSR（Server-Side Rendering）核心概念、工作原理及最佳实践。

## 目录

1. [核心结论](#核心结论)
2. [SSR vs CSR vs SSG 概念对比](#ssr-vs-csr-vs-ssg-概念对比)
3. [Vue SSR 工作原理](#vue-ssr-工作原理)
4. [Hydration 机制详解](#hydration-机制详解)
5. [Nuxt.js 入门指南](#nuxtjs-入门指南)
6. [服务端/客户端代码差异处理](#服务端客户端代码差异处理)
7. [状态序列化](#状态序列化)
8. [Hydration Mismatch 问题排查](#hydration-mismatch-问题排查)
9. [常见错误和解决方案](#常见错误和解决方案)
10. [适用场景分析](#适用场景分析)

---

## 核心结论

| 特性 | CSR | SSR | SSG |
|------|-----|-----|-----|
| 首屏渲染 | 慢（需下载 JS） | 快 | 快 |
| SEO | ❌ 差 | ✅ 好 | ✅ 好 |
| 服务器负载 | 低 | 高 | 极低 |
| 交互性 | 快（ hydration 后） | 快（ hydration 后） | 快（ hydration 后） |
| 适用场景 | 管理后台、SPA | 内容型网站 | 博客、文档 |

> **核心流程**：Server Render → HTML String → Browser → **Hydration** → Interactive App

---

## SSR vs CSR vs SSG 概念对比

### 三种渲染模式

```
┌─────────────────────────────────────────────────────────────┐
│                         CSR (Client-Side Rendering)        │
│  Server ──[空白HTML+JS链接]──▶ Browser ──[下载JS]──▶ 渲染    │
│  首屏: 慢  SEO: 差  服务器负载: 低                          │
├─────────────────────────────────────────────────────────────┤
│                         SSR (Server-Side Rendering)         │
│  Server ──[渲染HTML]──▶ Browser ──[显示内容]──▶ Hydration  │
│  首屏: 快  SEO: 好  服务器负载: 中                          │
├─────────────────────────────────────────────────────────────┤
│                         SSG (Static Site Generation)        │
│  Build时 ──[预渲染HTML]──▶ CDN ──[直接返回]──▶ Hydration  │
│  首屏: 快  SEO: 好  服务器负载: 极低                        │
└─────────────────────────────────────────────────────────────┘
```

### 具体对比

| 维度 | CSR | SSR | SSG |
|------|-----|-----|-----|
| **定义** | 浏览器运行 JS 动态渲染 | 服务器Node.js渲染完整HTML | 构建时预渲染静态HTML |
| **首屏速度** | 慢（需等JS下载执行） | 快（HTML直接显示） | 快（同SSR但无服务端开销） |
| **SEO** | 差（内容在JS中） | 好（内容在HTML中） | 好 |
| **服务器负载** | 极低 | 中等（每个请求需渲染） | 极低（静态文件） |
| **实时性** | 高（数据来自API） | 高（实时服务端渲染） | 低（需重新构建） |
| **TTI（可交互时间）** | 慢 | 快 | 快 |
| **适用场景** | 管理后台、SPA | 电商、社交、内容平台 | 博客、文档、营销页 |

### 核心区别图解

```
CSR:
  请求 ──▶ 服务器返回空白壳 ──▶ 下载JS ──▶ 执行JS ──▶ 渲染内容
                                                                      ↑ 用户看到内容 (慢)

SSR:
  请求 ──▶ 服务器渲染完整HTML ──▶ 浏览器直接显示 ──▶ Hydration ──▶ 可交互
                                                   ↑ 用户看到内容 (快)

SSG:
  构建 ──▶ 生成静态HTML ──▶ CDN部署
  请求 ──▶ CDN返回静态HTML ──▶ Hydration ──▶ 可交互
                                            ↑ 用户看到内容 (快)
```

---

## Vue SSR 工作原理

### Vue SSR 核心流程

```
┌──────────────────────────────────────────────────────────────────┐
│                          Vue SSR 完整流程                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. [Server] createSSRApp(App) ──▶ renderToString() ──▶ HTML   │
│                                                                  │
│   2. [Server] 返回完整 HTML（内联 state）                         │
│                                                                  │
│   3. [Browser] 接收 HTML ──▶ 立即显示内容（无需等待JS）           │
│                                                                  │
│   4. [Browser] 下载 JS Bundle                                   │
│                                                                  │
│   5. [Browser] Vue hydration ──▶ 接管 DOM ──▶ 可交互应用        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Vite SSR 示例

```js
// server.js
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import App from './App.vue';

export async function render(url) {
  const app = createSSRApp(App, { url });

  // 服务端渲染为 HTML 字符串
  const html = await renderToString(app);

  return html;
}
```

```js
// entry-server.js
import { createSSRApp } from 'vue';
import App from './App.vue';

export default () => {
  const app = createSSRApp(App);
  return { app };
};
```

```js
// entry-client.js
import { createApp } from 'vue';
import App from './App.vue';

// 客户端激活（Hydration）
createApp(App).mount('#app'); // hydrate: true
```

### Vue SSR 库

Vue 官方提供两个核心包：

| 包名 | 用途 |
|------|------|
| `vue/server-renderer` | 服务端渲染 API（`renderToString`、`renderToNodeStream`） |
| `vue` | 同时支持服务端和客户端 |

---

## Hydration 机制详解

### 什么是 Hydration

Hydration（也称为"注水"）是将服务端渲染的静态 HTML 转换为可交互 Vue 应用的过程。

```
┌─────────────────────────────────────────────────────────────┐
│                        Hydration 过程                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  服务端渲染的 HTML:                                           │
│  <div id="app">                                             │
│    <h1>Hello World</h1>                                     │
│    <button>Click me</button>                                │
│  </div>                                                     │
│                                                             │
│         ↓ Hydration ↓                                        │
│                                                             │
│  Vue 客户端接管:                                              │
│  - 复用已有 DOM 节点                                          │
│  - 绑定事件处理器                                            │
│  - 激活响应式系统                                            │
│  - 应用变为可交互                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Hydration 执行时机

```vue
<template>
  <div>{{ message }}</div>
  <button @click="onClick">Click</button>
</template>

<script setup>
// ✅ Hydration 完成前不要依赖 DOM 操作
import { onMounted, nextTick } from 'vue';

onMounted(() => {
  // ✅ onMounted 时 hydration 已完成，可以安全操作 DOM
  console.log('Hydration 完成');
});

// ⚠️ setup 执行时 hydration 可能未完成
// 不要在这里做依赖 DOM 的操作
</script>
```

### Hydration 关键点

1. **服务端渲染 HTML**：生成静态 HTML 字符串，包含内容和基本结构
2. **客户端下载 JS**：浏览器下载 Vue bundle
3. **Hydration**：Vue 复用已有 DOM，绑定事件，激活响应式
4. **可交互**：用户可以点击、输入等

```js
// hydration 示意
// 1. 服务端
const html = await renderToString(app);

// 2. 客户端
// Vue 不创建新 DOM，而是复用已有 DOM
const app = createApp(App);
app.mount('#app', true); // hydrate: true
```

---

## Nuxt.js 入门指南

### Nuxt 是什么

Nuxt.js 是 Vue 生态中最成熟的 SSR 框架，简化 SSR/SSG/ISR 实现。

```
Nuxt = Vue + Vite/Webpack + Node.js 服务端 + 约定式路由 + 自动导入
```

### 核心优势

| 特性 | 说明 |
|------|------|
| 约定式路由 | `pages/index.vue` → `/`，`pages/user/[id].vue` → `/user/:id` |
| 自动导入 | 组件、composables 自动按需导入 |
| 服务端/客户端自动切换 | `useHead`、`useFetch` 等自动在服务端执行 |
| SSG/ISR 支持 | 一键切换静态生成和增量渲染 |
| SEO 友好 | 内置 `useHead`、`useSeoMeta` |

### Nuxt 项目结构

```
my-nuxt-app/
├── nuxt.config.ts
├── app.vue
├── pages/
│   ├── index.vue          # /
│   ├── about.vue          # /about
│   └── user/
│       └── [id].vue       # /user/:id
├── components/
│   ├── Header.vue         # 自动导入
│   └── UserCard.vue
├── composables/
│   └── useUser.ts         # 自动导入
└── server/
    └── api/
        └── user/[id].get.ts  # API 路由
```

### Nuxt 核心用法

#### 数据获取

```vue
<template>
  <div v-if="pending">Loading...</div>
  <div v-else>{{ data }}</div>
</template>

<script setup>
// 服务端执行，自动序列化
const { data, pending } = await useFetch('/api/user/1');

// ✅ 自动在服务端渲染时获取数据
// ✅ 自动在客户端导航时获取数据
</script>
```

#### SEO 头部

```vue
<script setup>
useHead({
  title: '用户页面',
  meta: [
    { name: 'description', content: '用户详情页' }
  ]
});
</script>
```

#### 服务端/客户端判断

```vue
<script setup>
// ✅ Nuxt 3 提供的内置方法
if (process.server) {
  // 仅在服务端执行
  console.log('服务端渲染');
}

if (process.client) {
  // 仅在客户端执行
  console.log('客户端渲染');
}
</script>
```

### Nuxt 渲染模式

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  // SSR 模式（默认）
  ssr: true,

  // SSG 模式（预渲染所有页面）
  ssr: false, // SPA 模式

  // 或使用 routeRules 进行混合
  routeRules: {
    '/': { prerender: true },           // 首页预渲染
    '/blog/**': { swr: 3600 },          // Blog 页面 ISR
    '/admin/**': { ssr: false }         // 管理后台 SPA
  }
});
```

---

## 服务端/客户端代码差异处理

### 问题背景

有些代码只能在服务端或客户端运行，需要显式区分。

### 常用判断方式

| 环境 | Nuxt 2 | Nuxt 3 | 纯 Vue SSR |
|------|--------|--------|------------|
| 服务端 | `process.server` | `process.server` | `typeof window === 'undefined'` |
| 客户端 | `process.client` | `process.client` | `typeof window !== 'undefined'` |
| 仅首次 | `process.client` | `import.meta.client` | — |

### Nuxt 3 示例

```vue
<script setup>
// ✅ 服务端仅执行
if (process.server) {
  // 数据库查询、文件读取等
  const db = await connectToDatabase();
}

// ✅ 客户端仅执行
if (process.client) {
  // 浏览器 API、第三方 SDK 初始化等
  const analytics = new Analytics();
  analytics.init();
}
</script>
```

### 纯 Vue SSR 示例

```js
// 判断是否在浏览器环境
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  // 浏览器代码
  document.addEventListener('click', handleClick);
}

// 服务端代码
const fs = require('fs');
const content = fs.readFileSync('./data.json');
```

### 生命周期钩子选择

```vue
<script setup>
import { onMounted } from 'vue';

// ❌ 不要在 setup 顶层直接访问 window
// const width = window.innerWidth; // 服务端会报错

onMounted(() => {
  // ✅ onMounted 仅在客户端执行，可以安全访问浏览器 API
  const width = window.innerWidth;
  console.log('窗口宽度:', width);
});
</script>
```

### 组件卸载清理

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';

let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    console.log('每秒执行');
  }, 1000);
});

onUnmounted(() => {
  // ✅ 清理工作仅在客户端需要
  if (timer) clearInterval(timer);
});
</script>
```

---

## 状态序列化

### 问题背景

服务端渲染时，组件状态（如 Pinia/Vuex store）需要传递给客户端。

### Pinia 状态序列化

Pinia 使用 `pinia-plugin-persistedstate` 或内置序列化：

```ts
// 定义 store
export const useUserStore = defineStore('user', {
  state: () => ({
    name: 'Alice',
    token: null
  }),
  actions: {
    async fetchUser() {
      const res = await fetch('/api/user');
      this.name = res.name;
    }
  }
});
```

```ts
// 服务端 - 渲染前获取状态
const userStore = useUserStore();
await userStore.fetchUser();

// 将状态注入 HTML（通过 window.__INITIAL_STATE__）
const initialState = JSON.stringify(userStore.$state);
```

```html
<!-- 服务端返回的 HTML -->
<script>
  window.__INITIAL_STATE__ = {{ initialState }};
</script>
```

```js
// 客户端 - 恢复状态
const pinia = createPinia();
pinia.state.value = window.__INITIAL_STATE__;
```

### Vuex 状态序列化

Vuex 使用 `vuex-router-sync` 或手动序列化：

```js
// 服务端渲染时序列化 state
import { renderToString } from 'vue/server-renderer';

async function render(url, store) {
  const context = { url };
  const app = createApp(App, { store });

  const html = await renderToString(app);

  // 序列化 Vuex state
  const state = store.state;

  return {
    html,
    state: JSON.stringify(state)
  };
}
```

### Hydration 时状态恢复

```html
<!-- 服务端注入的 state -->
<script>
  window.__INITIAL_STATE__ = "{{ state }}";
</script>

<script src="/app.js"></script>
<script>
  // 客户端恢复状态
  const store = createStore({
    state: JSON.parse(window.__INITIAL_STATE__)
  });
  app.use(store);
</script>
```

### 注意事项

| 问题 | 原因 | 解决 |
|------|------|------|
| 函数无法序列化 | 函数不是 JSON | 仅传递数据，客户端重新初始化 |
| Set/Map 无法序列化 | JSON 不支持 | 转换为普通数组/对象 |
| 日期对象 | 转为 ISO 字符串 | 客户端再转换回来 |

---

## Hydration Mismatch 问题排查

### 什么是 Hydration Mismatch

服务端渲染的 HTML 与客户端渲染的结果不一致。

```
┌─────────────────────────────────────────────────────────────┐
│                   Hydration Mismatch                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  服务端渲染: <div>Hello World</div>                         │
│                                                             │
│  客户端渲染: <div>Hello World!</div>  ← 不一致！            │
│                                                             │
│  Vue 会在控制台报错:                                          │
│  [Vue warn]: hydration: difference detected on <div>...    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 常见原因

| 原因 | 示例 | 解决 |
|------|------|------|
| 时间相关 | `new Date().toLocaleString()` | 使用 `onMounted` 或 `useRequestURL` |
| 随机数 | `Math.random()` | 使用固定 seed |
| 浏览器 API | `window.innerWidth` | 用 `ref` 在 `onMounted` 后更新 |
| 条件渲染差异 | `v-if="isClient"` | 统一服务端和客户端逻辑 |
| 响应式数据差异 | 服务端/客户端获取数据不同 | 预获取数据 |

### 排查工具

```vue
<script setup>
import { onMounted } from 'vue';

if (import.meta.dev) {
  // 仅开发环境记录 hydration 信息
  onMounted(() => {
    console.log('Hydration 完成');
  });
}
</script>
```

### 常见问题与解决

#### 1. 时间/日期不一致

```vue
<script setup>
import { ref, onMounted } from 'vue';

// ❌ 错误：服务端和客户端时间可能不同
const now = new Date().toISOString();

// ✅ 正确：使用固定值或客户端专属状态
const clientTime = ref('');

onMounted(() => {
  clientTime.value = new Date().toISOString();
});
</script>
```

#### 2. 窗口/DOM 相关

```vue
<script setup>
import { ref } from 'vue';

// ❌ 错误：服务端没有 window
const scrollY = window.scrollY;

// ✅ 正确
const scrollY = ref(0);

onMounted(() => {
  scrollY.value = window.scrollY;
});
</script>
```

#### 3. v-if 导致的不一致

```vue
<script setup>
// ✅ 正确：process.client 在两端结果一致
const showClientOnly = ref(false);

onMounted(() => {
  showClientOnly.value = true;
});
</script>
```

#### 4. 使用 `<ClientOnly>` 组件（Nuxt）

```vue
<template>
  <!-- 仅客户端渲染的内容 -->
  <ClientOnly>
    <HeavyClientLib />
  </ClientOnly>
</template>
```

---

## 常见错误和解决方案

### 1. `window is not defined`

**原因**：在服务端代码中访问了浏览器对象。

```js
// ❌ 错误
import Cookies from 'js-cookie';
const token = Cookies.get('token');

// ✅ 正确：条件导入
if (typeof window !== 'undefined') {
  import Cookies from 'js-cookie').then(Cookies => {
    const token = Cookies.get('token');
  });
}
```

### 2. `document is not defined`

**原因**：服务端没有 DOM。

```js
// ❌ 错误
const modal = document.querySelector('.modal');

// ✅ 正确
if (typeof document !== 'undefined') {
  const modal = document.querySelector('.modal');
}
```

### 3. `Cannot read property of undefined`

**原因**：访问了 `undefined` 的属性，通常是异步数据问题。

```vue
<script setup>
const { data: user } = await useFetch('/api/user');

// ❌ 可能报错：user 是 undefined
console.log(user.value.name);

// ✅ 安全访问
console.log(user.value?.name);
</script>
```

### 4. Pinia Store 状态丢失

**原因**：服务端和客户端 store 未同步。

```ts
// ✅ 正确：服务端传递 state 到客户端
// nuxt.config.ts
export default defineNuxtConfig({
  plugins: [{ src: '/pinia.ts', ssr: false }]
});
```

### 5. 第三方库 SSR 不兼容

**原因**：某些库依赖浏览器 API。

```js
// 方案：动态导入
if (process.client) {
  const Chart = await import('chart.js');
}
```

### 6. 内存泄漏

**原因**：服务端创建的定时器、事件监听器未清理。

```vue
<script setup>
import { onUnmounted } from 'vue';

let timer;

onMounted(() => {
  timer = setInterval(() => {}, 1000);
});

onUnmounted(() => {
  clearInterval(timer); // ✅ 清理
});
</script>
```

---

## 适用场景分析

### SSR 适用场景

| 场景 | 原因 |
|------|------|
| **内容型网站**（电商、新闻、博客） | SEO 重要，需要快速首屏 |
| **需要 SEO 的营销页** | 搜索引擎需要抓取完整内容 |
| **用户生成内容平台** | 社交分享时需要预览内容 |
| **需要登录后渲染** | 部分页面需要服务端获取数据 |

### CSR 适用场景

| 场景 | 原因 |
|------|------|
| **管理后台** | SEO 不重要，交互频繁 |
| **高度交互应用**（看板、IDE） | 需要大量客户端逻辑 |
| **实时数据应用** | 数据频繁变化，SSR 开销大 |

### SSG 适用场景

| 场景 | 原因 |
|------|------|
| **文档网站** | 内容相对静态，构建时生成 |
| **博客** | 文章发布后不常变化 |
| **营销页** | 高并发时 CDN 缓存效果好 |
| **GitHub Pages 部署** | 无服务端支持 |

### 渲染模式选择决策树

```
是否需要 SEO？
  │
  ├── 否 ──▶ 内容是否频繁变化？
  │           │
  │           ├── 是 ──▶ CSR（SPA）
  │           │
  │           └── 否 ──▶ SSG
  │
  └── 是 ──▶ 是否需要实时数据？
              │
              ├── 是 ──▶ SSR
              │
              └── 否 ──▶ SSG
```

### Nuxt 渲染模式选择

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // 静态文档，无需服务端
    '/docs/**': { prerender: true },

    // 博客，发布后相对静态
    '/blog/**': { swr: 3600 },

    // 电商，需要 SEO + 实时库存
    '/product/**': { ssr: true },

    // 管理后台，无需 SEO
    '/admin/**': { ssr: false }
  }
});
```

---

## 参考资料

- [Vue SSR 官方指南](https://vuejs.org/guide/scaling-up/ssr.html)
- [Nuxt 3 文档](https://nuxt.com/)
- [Vue SSR 入门 - VueMastery](https://www.vuemastery.com/blog/vue-ssr/)
- [Vite SSR 文档](https://vitejs.dev/guide/ssr.html)
- [Vue Hydration 原理 - Vue Core Team](https://github.com/vuejs/core)
