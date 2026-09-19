> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: 按需引入样式 / tree-shaking

# 07 · 按需引入样式（Tree-shaking Style Import）

## 你会学到什么

组件库动辄几百 KB CSS，全部引入会让主 bundle 变大。
主流方案：

1. **`unplugin-vue-components`** 自动按需引入组件 JS（基于编译器扫描模板）
2. **`unplugin-vue-components/resolvers`** 进一步自动引入组件对应的 CSS
3. **`babel-plugin-import` / `unplugin-import`**（更老的方案，babel 时代）
4. **CSS Modules** —— 局部作用域，避免类名冲突

本 demo 演示：

- 写一个「伪组件库」 `AcmeUI` —— 5 个组件，每个有独立的 .vue + .css
- 完整引入（全量 CSS 进 bundle）
- 按需引入（resolvers 只引入用到的）
- CSS Modules 隔离（类名 hash）

## 真实场景（抽象）

> "我们的站点用了 Element Plus，但用户实际只用 Button、Input、Form。
> 全量引入 ~150KB CSS，按需只需 ~20KB。"

`unplugin-vue-components` 是 Vite 生态首选，无需 babel，构建期扫描模板。

## 动手试

1. 看 **「完整引入」** —— DevTools Network 看所有 5 个 CSS 都加载
2. 看 **「按需引入」** —— 只加载 Button + Input 的 CSS
3. 切到 **「CSS Modules」** 演示 —— 类名带 hash，类名冲突被消除
4. 切 **「运行时报错」** —— 演示 `import { ElButton }` 写法未配 resolver 时输出

## 关键模式

### vite.config.ts（按需）

```ts
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

模板里写 `<el-button>` —— 编译器自动转为：

```js
import { ElButton } from 'element-plus'                  // JS
import 'element-plus/theme-chalk/el-button.css'          // CSS
```

### babel-plugin-import（旧方案）

```js
// .babelrc
{
  "plugins": [
    ["import", {
      "libraryName": "ant-design-vue",
      "libraryDirectory": "es",
      "style": "css"
    }]
  ]
}
```

但：
- 必须用 babel（Vite 默认不走 babel）
- 必须写 `import { Button } from 'ant-design-vue'` 不能写全局
- 维护差，**Vue 3 + Vite 已不推荐**

### CSS Modules（隔离类名）

```vue
<style module>
.button { background: var(--c-primary); }   /* 编译为 .button_hash123 */
</style>

<template>
  <button :class="$style.button">按钮</button>
</template>
```

类名 hash 化，避免全局污染。组件库内部常用。

## 对比

| 方案 | 适用 | 优 | 劣 |
|------|------|----|----|
| **全量引入** | 组件 < 30 个 / 体积不敏感 | 简单 | 包大 |
| **unplugin-vue-components** | Vite / Webpack 5 | 零运行时；模板自动识别 | 需配置 |
| **babel-plugin-import** | babel 项目 | 老牌兼容 | 与 Vite 不友好 |
| **vite-plugin-style-import** | Vite + 旧 UI 库 | 直接 | 不再流行 |
| **CSS Modules** | 自研组件库 | 隔离强 | 不能跨组件复用类名 |
| **CSS-in-JS** | 主题动态切换 | 动态 | 运行时开销 |

## 常见陷阱

1. **样式覆盖优先级**：按需引入会让组件 CSS 排到主 CSS 之前，被覆盖
2. **DevTools 看 CSS 顺序**：Network → CSS → 看加载顺序
3. **`style="css"` vs `style: "css"` vs `style: true`**：babel-plugin-import 三种写法的差异
4. **全局函数 `ElMessage`**：按需引入不会自动注册全局命令函数，需 `app.use(ElementPlus)`

## 延伸阅读

- [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
- [Element Plus 按需引入](https://element-plus.org/zh-CN/guide/quickstart.html#按需引入)
- [CSS Modules 规范](https://github.com/css-modules/css-modules)

## 下一步

08 · SSR 适配 —— 看完打包优化，
08 教你把组件库部署到 Nuxt / Vite SSR 时遇到的 hydration 问题。
