---
title: Vue 组件库横向对比与选型指南
tags: vue, component-library, element-plus, naive-ui, ant-design-vue, primevue, vuetify, headless-ui, reka-ui
---

# Vue 组件库横向对比与选型指南

## 一、主流组件库全景

| 库 | 维护者 | 包大小（gzip） | 样式风格 | 协议 | 最近活跃 |
|----|--------|----------------|---------|------|---------|
| **Element Plus** | 饿了么 | ~120 KB | 中后台、克制 | MIT | 活跃 |
| **Naive UI** | tusen-ai（个人） | ~70 KB | 现代、C 端友好 | MIT | 活跃 |
| **Ant Design Vue** | 社区 + vueComponent | ~135 KB | 中后台、稳重 | MIT | 活跃 |
| **PrimeVue** | PrimeTek | ~80 KB | 多主题、丰富 | MIT | 活跃 |
| **Vuetify** | vuetifyjs | ~140 KB | Material Design | MIT | 活跃 |
| **Headless UI** | tailwind 团队 | ~6 KB | 无样式 | MIT | 活跃 |
| **Reka UI / Radix Vue** | unovue | ~12 KB | 无样式 | MIT | 活跃 |

## 二、维度横向对比

### 1. 核心工程指标

| 维度 | Element Plus | Naive UI | Ant Design Vue | PrimeVue | Vuetify | Headless UI | Reka UI |
|------|--------------|----------|----------------|----------|---------|-------------|---------|
| TypeScript 友好度 | ★★★★★ | ★★★★★ | ★★★★ | ★★★★ | ★★★★ | ★★★★★ | ★★★★★ |
| SSR 支持 | ★★★★ | ★★★★ | ★★★★ | ★★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| 按需引入 | ★★★★★ | ★★★★ | ★★★★★ | ★★★★ | ★★★★ | ★★★★★ | ★★★★★ |
| 主题系统 | ★★★ | ★★★★★ | ★★★★ | ★★★★★ | ★★★★ | ★★★★★ | ★★★★★ |
| Tree-shaking | ★★★★★ | ★★★★ | ★★★★ | ★★★★ | ★★★ | ★★★★★ | ★★★★★ |
| 虚拟列表 | ★★★★★ | ★★★★★ | ★★★★ | ★★★★ | ★★★★ | — | — |
| a11y | ★★★ | ★★★ | ★★★ | ★★★ | ★★★★ | ★★★★★ | ★★★★★ |
| 文档质量 | ★★★★★ | ★★★★★ | ★★★★ | ★★★★ | ★★★★★ | ★★★★ | ★★★★ |
| 自定义视觉难度 | ★★★ | ★★★★ | ★★ | ★★★ | ★★ | ★★★★★ | ★★★★★ |

### 2. 关键模式分布

| 模式 | Element Plus | Naive UI | Ant Design Vue | PrimeVue | Vuetify | Headless UI / Reka UI |
|------|--------------|----------|----------------|----------|---------|----------------------|
| `<ConfigProvider>` 全局配置 | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `useFormItem` 多层 context | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| CSS 变量主题 | partial | ✓★ | partial | ✓ | partial | — |
| 多态组件（`as` / `tag`） | ✓ (`tag`) | partial | partial | partial | partial | ✓★ (`as`) |
| 自动按需引入 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 复合组件 + primitive | — | — | — | — | — | ✓★ |
| `useColorMode` 类暗色模式 | partial | ✓ | partial | ✓ | ✓ | — |

### 3. 适用场景速查

| 项目类型 | 推荐 | 原因 |
|----------|------|------|
| 中后台（表格密集、表单多） | Element Plus / Ant Design Vue | 组件齐全、企业控件完备 |
| C 端（用户面向、视觉重） | Naive UI / PrimeVue | 主题切换灵活、设计现代 |
| 国际化产品 | PrimeVue（80+ locale 内置） / Element Plus | PrimeVue i18n 最完整 |
| 移动端 / 跨端 | Vuetify（Material） / Vant | Material 设计语言 |
| 自研设计系统 | Reka UI / Headless UI + Tailwind | 完全控制视觉与交互 |
| 大型 SaaS | Element Plus + 自研 widget | 生态成熟、文档全 |
| 高审美品牌官网 | Reka UI + 自写设计 | 视觉不被框架束缚 |

## 三、选择决策树

```
你的项目是？
├── 中后台管理系统
│   ├── 表格 + 表单为主
│   │   ├── 需要 20+ 表格控件 + 树 + 穿梭框 → Element Plus
│   │   ├── 强 type safety + Vue 3 first → Naive UI
│   │   └── React 风格迁移 → Ant Design Vue
│   ├── 多主题切换 → PrimeVue
│   └── Material Design 严格 → Vuetify
├── 面向 C 端产品
│   ├── 主题切换 + 暗色模式 → Naive UI
│   ├── 多 locale + 国际化 → PrimeVue
│   └── 极致视觉控制 → Reka UI / Headless UI + 自写设计
└── 自研组件库 / 内部设计系统
    └── Reka UI / Headless UI（交互核心）+ 自写样式 + 设计 token
```

## 四、按需引入与打包体积

### Vite + Element Plus（推荐）

```ts
// vite.config.ts
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

模板里直接用 `<el-button>` —— 编译器自动 `import { ElButton } from 'element-plus'` + CSS。

### Nuxt 3 自动集成

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@element-plus/nuxt'],
})
```

### Naive UI 自动按需（官方推荐）

Naive UI 默认就是 tree-shakeable，按 ES module 引入即可：

```ts
import { NButton, NInput, NSpace } from 'naive-ui'
```

不用额外配 resolver，Vite 自动 tree-shake 未用到的。

### babel-plugin-import（不推荐 Vite 项目）

Vite 默认不跑 babel，新项目不要用。老项目可保留：

```js
// babel.config.js
{
  plugins: [
    ['import', { libraryName: 'ant-design-vue', style: 'css' }]
  ]
}
```

## 五、SSR 适配路径

### Nuxt 3 + 组件库

- Element Plus：`@element-plus/nuxt` 模块
- Naive UI：官方 Nuxt 模块 `nuxtjs-naive-ui`
- Ant Design Vue：手动配 + `unplugin-vue-components`
- PrimeVue：手动 `app.use(PrimeVue)`

### 手动 SSR（Vite + vue-server-renderer）

参见 [学习路径 08](https://你的站点/learning-path/component-library/08.ssr-component-library) —— 重点是：

1. **window/document 访问** → 移入 `onMounted` 或包 `<ClientOnly>`
2. **Hydration mismatch** → 不在 setup 顶层用 `Date.now()` / `Math.random()` / `localStorage`
3. **CSS 闪烁** → 配 SSR CSS extract

## 六、主题系统深度对比

### Element Plus —— SCSS 变量 + 覆盖类

```scss
// 覆盖主题：换 SCSS 变量重编译
$--color-primary: #42b883;
```

切换主题 = 切 CSS 文件或换 root 类名。

### Naive UI —— CSS 变量（推荐）

```ts
// 运行时换 token
const themeOverrides = computed(() => ({
  common: { primaryColor: '#42b883' },
}))
```

切换主题 = 改一组 CSS 变量，零重渲。

### Ant Design Vue —— 算法 + token

```ts
import { theme } from 'ant-design-vue'
app.use(Antd, {
  theme: { token: { colorPrimary: '#42b883' } },
})
```

内置暗色算法、紧凑算法。token 派生色自动计算。

### PrimeVue —— preset + Aura / Lara / Nora 多主题

```ts
app.use(PrimeVue, {
  theme: { preset: Aura, options: { darkModeSelector: '.dark' } },
})
```

预设主题丰富，自定义空间也大。

## 七、自研组件库：从零起步清单

如果你决定自己写（用 Reka UI 风格）：

1. **infra**（2 周）
   - TS 配置 + Vite + monorepo（pnpm workspaces）
   - ESLint + Stylelint + 测试（vitest + @vue/test-utils + Playwright）
   - `unplugin-vue-components` 给自己用
2. **token 系统**（1 周）
   - token 表（颜色、间距、字号、圆角、阴影）
   - CSS 变量导出 + useThemeVars composable
3. **核心组件**（每组件 1-3 天）
   - Button（含 6 个 variant × 3 个 size）
   - Input / Form / FormItem（3 层 context）
   - Select / Tree / Table（虚拟滚动）
   - Dialog / Drawer / Tooltip（Teleport + Floating UI）
4. **工具**（持续）
   - useNamespace（class 前缀）
   - useSize（来自 Form/ButtonGroup context）
   - useId（label-for 关联）
   - createContext（compound 组件）
5. **文档 + 演示**（2 周）
   - VitePress + `vitepress-demo-plugin`
   - 每个组件 ≥ 3 个 demo

## 八、本路径 8 个 demo 索引

- [01 · `<ConfigProvider>` provide/inject](../learning-path/component-library/src/01.provide-inject-config-provider/description.md)
- [02 · Headless composable + 用户样式](../learning-path/component-library/src/02.composable-use-component/description.md)
- [03 · CSS 变量主题系统](../learning-path/component-library/src/03.theme-system-css-vars/description.md)
- [04 · `useFormItemContext` 多层 context](../learning-path/component-library/src/04.use-form-item-context/description.md)
- [05 · 多态组件（Polymorphic `as`）](../learning-path/component-library/src/05.button-as/description.md)
- [06 · 虚拟滚动列表](../learning-path/component-library/src/06.virtualized-list/description.md)
- [07 · 按需引入样式](../learning-path/component-library/src/07.tree-shaking-style-import/description.md)
- [08 · SSR 适配](../learning-path/component-library/src/08.ssr-component-library/description.md)

## 九、避坑速查

| 坑 | 解法 |
|----|------|
| 组件库 CSS 与项目 CSS 顺序冲突 | 把组件库样式放最前，主样式最后 |
| 按需引入后 ElMessage / ElNotification 没注册 | 手动 `app.use(ElementPlus)` |
| SSR 报 `document is not defined` | `onMounted` 或 `ClientOnly` |
| Hydration mismatch（时间/随机数） | 用 `useState` 共享 |
| 虚拟列表行高变化 | `ResizeObserver` + positionMap 修正 |
| Pinia 与 provide/inject 二选一 | 单表单用 context；跨路由共享用 Pinia |
| 主题切换导致组件闪屏 | 用 CSS 变量（Naive UI 范式） |
| 多态组件 TS 推断失败 | 用 `ComponentPropsWithoutRef<T>` |

## 十、参考资源

### 官方文档

- [Element Plus](https://element-plus.org/)
- [Naive UI](https://www.naiveui.com/)
- [Ant Design Vue](https://antdv.com/)
- [PrimeVue](https://primevue.org/)
- [Vuetify](https://vuetifyjs.com/)
- [Headless UI for Vue](https://headlessui.com/vue/menu)
- [Reka UI](https://reka-ui.com/)

### 源码（参考实现）

- [Element Plus GitHub](https://github.com/element-plus/element-plus)
- [Naive UI GitHub](https://github.com/tusen-ai/naive-ui)
- [Ant Design Vue GitHub](https://github.com/ant-design/ant-design-vue)
- [PrimeVue GitHub](https://github.com/primefaces/primevue)
- [Reka UI GitHub](https://github.com/unovue/reka-ui)

### 工具与生态

- [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
- [VueUse](https://vueuse.org/)（多数组件库内部依赖）
- [Floating UI](https://floating-ui.com/)（定位引擎）

---

> 一句话总结：**Element Plus/Ant Design Vue = 中后台；Naive UI/PrimeVue = C 端主题切换；Reka UI/Headless UI = 自研设计系统**。选型永远从「项目类型 + 视觉控制需求」出发，不要从「流行度」出发。
