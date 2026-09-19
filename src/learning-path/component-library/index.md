---
page: true
title: Vue 组件库实战模式学习路径
aside: false
footer: false
returnToTop: false
---

<script>
import { defineAsyncComponent } from 'vue'
import ReplLoading from '@theme/components/ReplLoading.vue'
import { data } from './topic.data'

export default {
  components: {
    LearningPathRepl: defineAsyncComponent({
      loader: () => import('@theme/components/Vue3Repl/index.vue'),
      loadingComponent: ReplLoading
    })
  },
  provide() {
    return { learningPathData: data }
  }
}
</script>

# Vue 组件库实战模式

这条路径不抄任何一份官方文档，也不复述任何组件库的 API。本路径关注的始终是 **可迁移的工程模式**：

- 一个组件库是怎么组织「全局配置 → 单组件」的？Element Plus / Naive UI / Ant Design Vue 各自怎么实现？
- 一个 Headless 组件库怎么让「交互核心」与「视觉样式」解耦？Headless UI / Reka UI 的 composable 范式是什么？
- 一个组件库怎么设计主题？Naive UI 的 CSS 变量表 + Ant Design 的 token 算法 + Element Plus 的 namespace 类名体系有何差异？
- 一个组件库怎么兼顾 SSR？window/document 访问的 mock、`<ClientOnly>` 包裹、hydration mismatch 排查路径。
- 一个组件库怎么支持按需引入样式？`unplugin-vue-components` + `babel-plugin-import` 的边界条件。

每个 demo 都从一个**真实可运行**的小例子出发，**附一段与官方对比的引用**，让你能在 5 分钟内看完一个模式的核心代码，再用对比看出选型差异。

## 为什么做这条路径

主流组件库的差异点常被掩盖在「都用 Vue 写」这个表面相似之下。实际上：

| 模式 | 代表库 | 适用项目 |
|------|--------|----------|
| `<ConfigProvider>` + 类名体系 | Element Plus | 中后台、表格密集型 |
| `useThemeVars()` + CSS 变量 | Naive UI | C 端、需要主题切换 |
| Context Tree + `<Form>` / `<FormItem>` | Ant Design Vue | 表单密集型 |
| `createContext` + Primitive | Reka UI / Headless UI | 自研组件库 |
| `useConfig` + PrimeVueConfig | PrimeVue | 国际化 + 多套主题 |

学完本路径后，你能在 30 分钟内判断「我下一个项目该用哪个模式」，而不是「哪个组件库更流行」。

## 阅读顺序

8 个 demo 互相关联，但不是必须按序读。建议从你最常用的组件库对应的 demo 开始：

1. 用 Element Plus / Naive UI 的项目 — 先看 01 → 03 → 06
2. 自研组件库 — 先看 02 → 04 → 05 → 08
3. 做 C 端 / 主题切换多 — 先看 03 → 06 → 08
4. 关心打包体积 — 一定看 07

每节 `description.md` 末尾都给了「下一个 demo」与「可延伸阅读」。

<ClientOnly>
  <LearningPathRepl path="component-library" :data="data" />
</ClientOnly>
