---
page: true
title: Vue 生态工具链学习路径
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

# Vue 生态工具链

本路径不重复 Vue 文档的入门章节，而是站在**实战视角**梳理 Vue 工程师日常会用到的工程化工具：构建工具（Vite / VitePress）、按需引入（unplugin-vue-components / unplugin-auto-import）、运行时库（VueUse / Vue I18n / unhead）、测试链路（Vitest / Vue Test Utils / Cypress / Playwright）、质量门禁（ESLint）以及可观测性（bundle 体积分析）。

每条 demo 都聚焦一个真实问题：**怎么配、跑起来什么样、踩过什么坑**。配置类的 demo 用 Vite REPL 跑出可见产物，运行时库类的 demo 直接演示 API，测试类的 demo 用 `console.log` 跑出断言输出。配套的 `src/docs/tools/` 长文负责把零散的 demo 串成系统性的方法论。

## 涵盖范围

| 类别 | 工具 |
|---|---|
| 构建 / 文档站 | Vite、VitePress、`vite-ssg` |
| 按需引入 | `unplugin-vue-components`、`unplugin-auto-import` |
| 运行时 | Vue I18n、`@unhead/vue`、`@vueuse/core` |
| 测试 | Vitest、Vue Test Utils、Cypress、Playwright |
| 质量 | `@vue/eslint-config-typescript`、`eslint-plugin-vue` |
| 观测 | `rollup-plugin-visualizer` |

<ClientOnly>
  <LearningPathRepl path="ecosystem" :data="data" />
</ClientOnly>
