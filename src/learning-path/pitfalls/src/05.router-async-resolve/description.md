> 版本: Vue Router 4 | RFC: — | 状态: stable | 概念: 动态路由懒加载

# 路由懒加载白屏：字符串引用 vs 动态 import

## 你会学到什么

- 静态字符串 `component: HomePage` 不会触发按需打包
- `component: () => import('./HomePage.vue')` 触发 Vite chunk 拆分
- 写错路径时 build 报错但运行期才发现

## 错误示例

```js
const routes = [
  { path: '/home', component: HomePage },  // ← 静态引用，全量打包
]
```

## 修复版本

```js
const routes = [
  {
    path: '/home',
    component: () => import('./HomePage.vue'),  // ← 动态 import
  },
]
```

## 错误路径

```js
component: () => import('./HomePAge.vue')  // 大小写错，运行时白屏
```

修复：用 IDE 跳转 / `vite-plugin-checker` 静态校验

## 动手试

1. 看下方 routes 表
2. 切换「错误路径」观察提示「chunk 加载失败」
3. 切换「正确懒加载」显示 chunk 拆分

## 根因

字符串 component 走 ESM 静态依赖图，vite 把它并入主 chunk。`() => import()` 让 Vite 识别为动态依赖，单独打 chunk。

## 修复 / 选型

- 路由级全用 `() => import(...)`
- 大型路由加 `webpackChunkName` 注释便于调试
- 静态校验：`vite-plugin-vue` 在 build 阶段报路径错误

## 延伸阅读

- [Vue Router — Lazy Loading](https://router.vuejs.org/guide/advanced/lazy-loading.html)

## 小结

1. **现象**：首屏 chunk 太大 / 路径写错白屏。
2. **复现**：错误路径模拟。
3. **修复**：动态 import + 路径检查。
