---
title: VueUse    
tags: vueuse composable      
birth: 2026-09-19      
modified: 2026-09-19      
---

@vueuse/core 实战
===

> 本节不重复 VueUse 文档的 hook 索引（200+ 个），而是实战视角：站在「用 VueUse 时怎么不出错」的入口，串起按需引入、SSR 安全、组件内组合三个高频问题。配套的可交互 demo 见 [`/learning-path/ecosystem/#06.vueuse-core`](/learning-path/ecosystem/#06.vueuse-core)。

---

## 为什么用 VueUse

- **纯 Composition API**：所有 hook 都是函数，复用逻辑靠 `import`，不用 mixin / 高阶组件
- **响应式原生**：返回 `ref` / `computed`，跟 Vue 3 完美兼容
- **场景覆盖全**：DOM 监听、网络、状态、动画、设备能力、计时器一应俱全
- **SSR 友好**：大部分 hook 在服务端能跑（`import.meta.client` 分支处理）

## 按需引入

### 默认：自动 import

推荐用 `unplugin-auto-import`，配 `imports: ['vue', 'vue-router', '@vueuse/core']` 即可：

```ts
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core'],
      dts: 'src/types/auto-imports.d.ts',
    })
  ]
})
```

打开后 `<script setup>` 里直接写 `useLocalStorage`、`useDebounceFn`，插件自动注入 import + 生成 dts。

### 显式 import

如果项目没装 unplugin，就老老实实写：

```ts
import { useLocalStorage, useDebounceFn } from '@vueuse/core'
```

**不要 `import * as VueUse from '@vueuse/core'`**——那样会全量打包，连带把动画 / 浏览器能力检测等用不到的代码塞进 bundle。

## SSR 安全

VitePress、Nuxt、SSR 应用里 VueUse 的部分 hook 会访问 `window` / `document`：

| Hook | 服务端安全？ | 原因 |
|---|---|---|
| `useLocalStorage` | 部分 | 读 localStorage 会抛；写入初始值 OK |
| `useEventListener` | 不安全 | 直接 `window.addEventListener` |
| `useIntersectionObserver` | 不安全 | `IntersectionObserver` 是客户端 API |
| `useMediaQuery` | 安全 | 内部 `import.meta.client` 分支 |
| `useDebounceFn` / `useThrottleFn` | 安全 | 纯逻辑 |
| `ref` / `computed` 包装的 | 安全 | 不涉及 DOM |

### 修复模式

**模式 1：挪到 `onMounted`**

```ts
onMounted(() => {
  useEventListener(window, 'resize', handler)
})
```

**模式 2：客户端守卫**

```ts
if (import.meta.client) {
  useEventListener(window, 'resize', handler)
}
```

**模式 3：Nuxt 自动适配**

装 `@vueuse/nuxt`，Nuxt 会在客户端执行 hook，并把响应式状态通过 `useState` 跨 SSR/客户端共享。

## 实战组合

VueUse 在 component 里通常做这几件事：

```vue
<script setup>
import { ref, computed } from 'vue'
import { useLocalStorage, useDebounceFn, useEventListener, useIntersectionObserver } from '@vueuse/core'

// 持久化偏好
const theme = useLocalStorage('app.theme', 'light')

// 网络搜索（防抖）
const query = ref('')
const fetchResults = useDebounceFn(async (q) => {
  const res = await fetch(`/api/search?q=${q}`)
  results.value = await res.json()
}, 300)
watch(query, fetchResults)

// 全局键盘
useEventListener(window, 'keydown', (e) => {
  if (e.key === 'k' && (e.metaKey || e.ctrlKey)) openPalette()
})

// 滚动到元素时再渲染图表
const chartRef = ref(null)
useIntersectionObserver(chartRef, ([entry]) => {
  if (entry.isIntersecting) loadChart()
})
</script>
```

## 测试与 Mock

VueUse hook 返回 `ref`，直接用 `vi.useFakeTimers()` 控时间：

```ts
import { vi } from 'vitest'
import { useDebounceFn } from '@vueuse/core'

it('debounces', () => {
  vi.useFakeTimers()
  const fn = vi.fn()
  const debounced = useDebounceFn(fn, 300)
  debounced(1)
  debounced(2)
  vi.advanceTimersByTime(299)
  expect(fn).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(fn).toHaveBeenCalledWith(2)
})
```

## 常见坑

| 现象 | 原因 | 修复 |
|---|----|----|
| 服务端报错 `document is not defined` | hook 在 setup 顶层访问 DOM | 挪到 `onMounted` 或加 `import.meta.client` |
| localStorage 写入 JSON 报错 | 序列化失败 | 用 `{ serializer: { read, write } }` 自定义 |
| IntersectionObserver 不触发 | ref 在 v-if 分支里 | 改成 `v-show` 或确保元素在 mount 时存在 |
| 主题切换无效 | `useLocalStorage` 用了不同 key | 统一约定 key 前缀 |

## 何时不用 VueUse

- 极简项目（5 个以下 hook，直接手写更短）
- 想精细控制 hook 内部行为（VueUse 抽象已经定型）
- 服务端为主的项目（hook 多数围绕 DOM）

## 实战 demo 锚点

| 路径 | 演示 |
|---|---|
| [`/learning-path/ecosystem/#06.vueuse-core`](/learning-path/ecosystem/#06.vueuse-core) | 4 个核心 hook：useLocalStorage / useDebounceFn / useEventListener / useIntersectionObserver |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [VueUse 官方](https://vueuse.org/) | 完整 hook 索引 |
| [SSR 适配](https://vueuse.org/guide/ssr.html) | Nuxt / VitePress |
| [集合函数](https://vueuse.org/shared/createSharedComposable/) | 单例共享 |
| [`@vueuse/nuxt`](https://nuxt.com/modules/vueuse) | Nuxt 自动集成 |
