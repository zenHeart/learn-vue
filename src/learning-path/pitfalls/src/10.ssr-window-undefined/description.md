> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: SSR + 浏览器 API

# SSR 中访问 window 崩溃

## 你会学到什么

- 服务端没有 `window` / `document`，直接访问崩溃
- 组件 setup 顶层执行（包括 SSR 渲染阶段）
- `onMounted` 只在客户端运行，是安全位置
- `import.meta.client` / `import.meta.server` 显式判断

## 错误示例

```vue
<script setup>
const w = window.innerWidth  // SSR 时直接报 ReferenceError
</script>
```

## 修复版本

```vue
<script setup>
import { onMounted } from 'vue'
const width = ref(0)
onMounted(() => {
  width.value = window.innerWidth  // 安全
})
</script>
```

或用环境判断：

```js
if (import.meta.client) {
  // 浏览器侧执行
}
```

## 动手试

1. 点击「模拟 SSR 访问 window」 — 看到崩溃
2. 切换「onMounted 内访问」 — 安全
3. 看错误日志

## 根因

组件 `setup` 在服务端渲染阶段同步执行。`window` 在 Node 环境未定义。`onMounted` 注册的回调只在客户端 mount 时调用。

## 修复 / 选型

- 浏览器特有 API：`onMounted` 包一层
- 平台分支：`import.meta.client` 显式条件
- Nuxt：`process.client` / `process.server`（旧）/ `import.meta.client`（新）
- 数据 fetch：放到 `useFetch` / `onServerPrefetch`

## 延伸阅读

- [SSR — Writing SSR-friendly Code](https://vuejs.org/guide/scaling-up/ssr.html#writing-ssr-friendly-code)

## 小结

1. **现象**：SSR 时访问 window 报错。
2. **复现**：错误版本触发 ReferenceError。
3. **修复**：`onMounted` 或 `import.meta.client` 守卫。
