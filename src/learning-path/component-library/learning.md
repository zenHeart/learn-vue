---
layout: page
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
  setup() {
    return { data }
  }
}
</script>

# 组件库模式总览

| # | 模式 | 来源 | 关键词 |
|---|------|------|--------|
| 01 | `<ConfigProvider>` provide/inject | Element Plus | `provideGlobalConfig` / `useGlobalConfig` |
| 02 | Headless composable + 用户样式 | Headless UI / Reka UI | `useToggle` / Primitive |
| 03 | CSS 变量主题系统 | Naive UI | `useThemeVars` / cssVarsRef |
| 04 | Form / FormItem context 注入 | Ant Design Vue | `formItemContextKey` |
| 05 | 多态组件（Polymorphic `as`） | Element Plus / Reka UI | `<component :is>` + 类型守卫 |
| 06 | 虚拟滚动列表 | Element Plus `el-table-v2` / Naive UI | 固定行高 + 缓冲区 |
| 07 | 按需引入样式 | unplugin-vue-components | resolvers / babel-plugin-import |
| 08 | SSR 适配 | Element Plus / PrimeVue | `<ClientOnly>` / hydration |

## 学习建议

**时间紧**：直接看 01 → 03 → 05 → 06（覆盖 80% 选型决策）

**自研组件库**：02 → 04 → 05 → 08（4 节看完能写出 MVP 组件库）

**打包体积问题**：07 必看，并对比 01 的 namespace 类名

<ClientOnly>
  <LearningPathRepl :data="data" />
</ClientOnly>
