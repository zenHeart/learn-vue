# 版本与废弃状态审计

- 总 demo 数：**163**
- 已标注（最终）数：**163**
- 本轮新增标注数：**0**
- 已有标注（跳过）数：**163**
- 未标注（缺映射）数：**0**
- deprecated 数：**1**
- 内部 API 数：**1**
- 含迁移指引的 demo 数：**2**

## demo 标注清单

| 路径 | 版本 | 状态 | RFC | 概念 | 标注 | 迁移 |
| --- | --- | --- | --- | --- | --- | --- |
| `01.concept/src/00.basic` | Vue 3.0+ | stable | 0001-composition-api | 组件基础 / 模板语法 / 响应式 | yes | — |
| `01.concept/src/01.getting-started` | Vue 3.0+ | stable | — | createApp 起步 | yes | — |
| `01.concept/src/02.counter` | Vue 3.0+ | stable | — | ref + @click 入门 | yes | — |
| `01.concept/src/03.createApp` | Vue 3.0+ | stable | — | createApp / mount | yes | — |
| `01.concept/src/04.basic-render` | Vue 3.0+ | stable | — | 模板渲染 / mustache | yes | — |
| `01.concept/src/05.compile` | Vue 3.0+ | stable | — | 运行时编译 vs 预编译 | yes | — |
| `01.concept/src/06.template-expression` | Vue 3.0+ | stable | — | 模板表达式 / 受限全局 | yes | — |
| `01.concept/src/07.html` | Vue 3.0+ | stable | — | v-html 指令 | yes | — |
| `advanced/src/01.async-component` | Vue 3.0+ | stable | 0008-async-component | defineAsyncComponent | yes | — |
| `advanced/src/02.component-teleport` | Vue 3.0+ | stable | 0025-teleport | Teleport 组件 | yes | — |
| `advanced/src/03.teleport-modal` | Vue 3.0+ | stable | 0025-teleport | Teleport 组合用法（Modal） | yes | — |
| `advanced/src/04.diff` | Vue 3.x | 内部 API | — | Vue 内部 diff 算法 | yes | yes |
| `advanced/src/05.diff-animation` | Vue 3.0+ | stable | — | transition-group 列表过渡动画 | yes | — |
| `advanced/src/06.functional-component` | Vue 3.0+ | deprecated | 0009-functional-component | 函数式组件 | yes | yes |
| `advanced/src/07.global-properties` | Vue 3.0+ | stable | — | app.config.globalProperties | yes | — |
| `component-library/src/01.provide-inject-config-provider` | Vue 3.0+ | stable | — | provide/inject + ConfigProvider | yes | — |
| `component-library/src/02.composable-use-component` | Vue 3.x | stable | — | composable useXxx 组件封装 | yes | — |
| `component-library/src/03.theme-system-css-vars` | Vue 3.x | stable | — | 主题系统与 CSS 变量 | yes | — |
| `component-library/src/04.use-form-item-context` | Vue 3.x | stable | — | Form 表单上下文注入 | yes | — |
| `component-library/src/05.button-as` | Vue 3.x | stable | — | PolymorphicComponent 多态组件 | yes | — |
| `component-library/src/06.virtualized-list` | Vue 3.x | stable | — | 虚拟滚动列表 | yes | — |
| `component-library/src/07.tree-shaking-style-import` | Vue 3.x | stable | — | 按需引入样式 / tree-shaking | yes | — |
| `component-library/src/08.ssr-component-library` | Vue 3.x | stable | — | 组件库 SSR 适配 | yes | — |
| `composition/src/01.hooks` | Vue 3.0+ | stable | 0001-composition-api | Composition API 钩子函数 | yes | — |
| `composition/src/02.setup` | Vue 3.0+ | stable | 0001-composition-api | setup() 函数 | yes | — |
| `composition/src/03.setup-input-props` | Vue 3.0+ | stable | 0001-composition-api | setup 中访问 props | yes | — |
| `composition/src/04.setup-input-context` | Vue 3.0+ | stable | 0001-composition-api | setup context（attrs/slots/emit/expose） | yes | — |
| `composition/src/05.setup-return-render` | Vue 3.0+ | stable | 0001-composition-api | setup 返回渲染函数 | yes | — |
| `composition/src/06.setup-runtime` | Vue 3.0+ | stable | 0001-composition-api | setup 运行时选项 | yes | — |
| `composition/src/07.defineprops-default` | Vue 3.x | stable | 0003-script-setup | defineProps 类型与默认值 | yes | — |
| `composition/src/08.defineemits-validation` | Vue 3.x | stable | 0003-script-setup | defineEmits 事件校验 | yes | — |
| `composition/src/09.defineModel` | Vue 3.4+ | stable (3.4+) | 0008-define-model | defineModel 双向绑定宏 | yes | — |
| `composition/src/10.defineOptions` | Vue 3.3+ | stable (3.3+) | 0003-script-setup | defineOptions 组件选项宏 | yes | — |
| `composition/src/11.defineSlots` | Vue 3.3+ | stable (3.3+) | 0003-script-setup | defineSlots 插槽类型宏 | yes | — |
| `composition/src/12.provide-inject-typed` | Vue 3.x | stable | 0001-composition-api | provide/inject 类型化 | yes | — |
| `composition/src/13.provide-inject-as-state` | Vue 3.x | stable | 0001-composition-api | provide/inject 替代全局状态 | yes | — |
| `composition/src/14.lifecycles-deep` | Vue 3.x | stable | — | 生命周期钩子深入 | yes | — |
| `ecosystem/src/01.vite-sfc-on-demand` | Vite 5+ | stable | — | Vite 按需加载 SFC | yes | — |
| `ecosystem/src/02.unplugin-vue-components` | unplugin-vue-components 0.x+ | stable | — | unplugin-vue-components 自动注册 | yes | — |
| `ecosystem/src/03.vitepress-theme` | VitePress 1.x+ | stable | — | VitePress 自定义主题 | yes | — |
| `ecosystem/src/04.vue-i18n` | vue-i18n 9.x+ | stable | — | vue-i18n 国际化 | yes | — |
| `ecosystem/src/05.unhead-usehead` | unhead 1.x+ | stable | — | useHead 文档元信息 | yes | — |
| `ecosystem/src/06.vueuse-core` | VueUse 10.x+ | stable | — | VueUse 组合式工具集 | yes | — |
| `ecosystem/src/07.vitest-component` | Vitest 1.x+ | stable | — | Vitest 组件测试 | yes | — |
| `ecosystem/src/08.vitest-reactivity` | Vitest 1.x+ | stable | — | Vitest 响应式单元测试 | yes | — |
| `ecosystem/src/09.cypress-vue` | Cypress 12.x+ | stable | — | Cypress 端到端测试 | yes | — |
| `ecosystem/src/10.playwright-vue` | Playwright 1.x+ | stable | — | Playwright 端到端测试 | yes | — |
| `ecosystem/src/11.eslint-vue` | eslint-plugin-vue 9.x+ | stable | — | ESLint Vue 静态检查 | yes | — |
| `ecosystem/src/12.unplugin-auto-import` | unplugin-auto-import 0.x+ | stable | — | unplugin-auto-import 自动导入 | yes | — |
| `ecosystem/src/13.vite-ssr` | Vite SSR | stable | — | Vite SSR 服务端渲染 | yes | — |
| `ecosystem/src/14.bundle-analyze` | rollup-plugin-visualizer | stable | — | 产物体积可视化分析 | yes | — |
| `engineering/src/01.monorepo-vue-pnpm` | pnpm 8.x+ | stable | — | Vue + pnpm monorepo 工程化 | yes | — |
| `engineering/src/02.eslint-config-typescript-vue` | eslint-plugin-vue 9.x+ | stable | — | ESLint + TypeScript + Vue 配置 | yes | — |
| `engineering/src/03.vitest-vue-snapshot` | Vitest 1.x+ | stable | — | Vitest 组件快照测试 | yes | — |
| `engineering/src/04.git-hooks-husky-lint` | husky 8.x+ | stable | — | git hooks + husky + lint-staged | yes | — |
| `engineering/src/05.ci-caching-pnpm` | CI 通用 | stable | — | CI 缓存 pnpm store | yes | — |
| `engineering/src/06.vscode-settings-recommended` | VS Code | stable | — | VS Code 推荐设置 | yes | — |
| `performance/src/01.reactive-spread-projection` | Vue 3.x | stable | — | 响应式 spread 投影性能 | yes | — |
| `performance/src/02.reactive-overhead-bench` | Vue 3.x | stable | — | 响应式开销基准 | yes | — |
| `performance/src/03.computed-memo-vs-getter` | Vue 3.x | stable | — | computed memo vs getter 性能 | yes | — |
| `performance/src/04.v-memo-list` | Vue 3.2+ | stable (3.2+) | — | v-memo 列表性能 | yes | — |
| `performance/src/05.keepalive-include-excludes` | Vue 3.x | stable | — | KeepAlive include/excludes | yes | — |
| `performance/src/06.bundle-analyze-demo` | Vue 3.x | stable | — | 产物体积分析 | yes | — |
| `performance/src/07.virtualized-list-perf` | Vue 3.x | stable | — | 虚拟列表性能 | yes | — |
| `performance/src/08.ssr-vs-csr` | Vue 3.x | stable | — | SSR vs CSR 性能对比 | yes | — |
| `performance/src/09.reactive-deep-vs-shallow-bench` | Vue 3.x | stable | — | reactive 深浅代理性能基准 | yes | — |
| `performance/src/10.scheduler-batch` | Vue 3.x | stable | — | 调度器批处理 | yes | — |
| `performance/src/11.nexttick-vs-raf` | Vue 3.x | stable | — | nextTick vs requestAnimationFrame | yes | — |
| `performance/src/12.watch-effect-flush-options` | Vue 3.2+ | stable (3.2+) | 0001-composition-api | watchEffect flush 选项深入 | yes | — |
| `performance/src/13.reactive-vs-immutable` | Vue 3.x | stable | — | reactive vs Immutable.js 性能对比 | yes | — |
| `pinia/src/01.basic` | Pinia 2.x | stable | — | Pinia 基础 | yes | — |
| `pinia/src/02.setup-store` | Pinia 2.x | stable | — | setup 函数式 store | yes | — |
| `pinia/src/03.store-state-and-actions` | Pinia 2.x | stable | — | store 的 state 与 actions | yes | — |
| `pinia/src/04.getters-and-computed` | Pinia 2.x | stable | — | getters 等价于 computed | yes | — |
| `pinia/src/05.actions-async` | Pinia 2.x | stable | — | actions 中的异步处理 | yes | — |
| `pinia/src/06.subscribe-and-watch` | Pinia 2.x | stable | — | $subscribe 监听 store 变化 | yes | — |
| `pinia/src/07.cross-store-usage` | Pinia 2.x | stable | — | 跨 store 引用与组合 | yes | — |
| `pinia/src/08.pinia-plugin` | Pinia 2.x | stable | — | Pinia 插件机制 | yes | — |
| `pinia/src/09.options-vs-setup` | Pinia 2.x | stable | — | Options store vs setup store | yes | — |
| `pinia/src/10.pinia-and-vuerouter` | Pinia 2.x + Vue Router 4.x | stable | — | Pinia + Vue Router 组合 | yes | — |
| `pinia/src/11.testing-pinia-store` | Pinia 2.x + Vitest 1.x+ | stable | — | Pinia store 单元测试 | yes | — |
| `reactivity/src/01.reactive` | Vue 3.0+ | stable | 0001-composition-api | reactive() | yes | — |
| `reactivity/src/01.watch` | Vue 3.0+ | stable | 0001-composition-api | watch 基础 | yes | — |
| `reactivity/src/02.ref` | Vue 3.0+ | stable | 0001-composition-api | ref() | yes | — |
| `reactivity/src/02.watchEffect` | Vue 3.0+ | stable | 0001-composition-api | watchEffect | yes | — |
| `reactivity/src/03.computed` | Vue 3.0+ | stable | 0001-composition-api | computed() | yes | — |
| `reactivity/src/04.computed-accessor` | Vue 3.0+ | stable | 0001-composition-api | computed getter/setter | yes | — |
| `reactivity/src/05.computed-state` | Vue 3.0+ | stable | 0001-composition-api | computed 状态 | yes | — |
| `reactivity/src/06.toRefs` | Vue 3.0+ | stable | 0001-composition-api | toRefs / toRef | yes | — |
| `reactivity/src/07.readonly` | Vue 3.0+ | stable | 0001-composition-api | readonly / shallowReadonly | yes | — |
| `reactivity/src/08.isProxy` | Vue 3.0+ | stable | 0001-composition-api | isProxy / isReactive | yes | — |
| `reactivity/src/09.isRef` | Vue 3.0+ | stable | 0001-composition-api | isRef | yes | — |
| `reactivity/src/10.toRaw` | Vue 3.0+ | stable | 0001-composition-api | toRaw / markRaw | yes | — |
| `reactivity/src/11.reactive-origin` | Vue 3.0+ | stable | 0001-composition-api | reactive 起源与 Proxy | yes | — |
| `reactivity/src/12.reactive-deep-proxy` | Vue 3.x | stable | 0001-composition-api, 0003-data-option | reactive 深度代理 | yes | — |
| `reactivity/src/13.reactive-collection` | Vue 3.x | stable | 0001-composition-api | reactive Map / Set / WeakMap | yes | — |
| `reactivity/src/14.ref-unboxing` | Vue 3.x | stable | 0001-composition-api | ref 自动解包 | yes | — |
| `reactivity/src/15.computed-dirty-and-cache` | Vue 3.x | stable | 0001-composition-api | computed 脏检查与缓存 | yes | — |
| `reactivity/src/16.effect-scope` | Vue 3.x | stable | 0001-composition-api | effectScope / getCurrentScope | yes | — |
| `reactivity/src/17.watch-vs-watcheffect` | Vue 3.x | stable | 0001-composition-api | watch vs watchEffect | yes | — |
| `reactivity/src/18.watch-source-form` | Vue 3.x | stable | 0001-composition-api | watch 数据源形态 | yes | — |
| `reactivity/src/19.scheduler-and-queue` | Vue 3.x | stable | — | 调度器与任务队列 | yes | — |
| `reactivity/src/20.ontrack-debug` | Vue 3.0+ | stable | — | onTrack / onTrigger 调试 | yes | — |
| `reactivity/src/21.reactive-vs-ref-perf` | Vue 3.x | stable | — | reactive vs ref 性能对比 | yes | — |
| `reactivity/src/22.ssr-reactivity` | Vue 3.x | stable | — | SSR 响应式 | yes | — |
| `reactivity/src/23.toRaw-and-markraw` | Vue 3.x | stable | — | toRaw / markRaw 深入 | yes | — |
| `slots/src/01.slot-default` | Vue 3.0+ | stable | — | 默认插槽 | yes | — |
| `slots/src/02.slot-declare` | Vue 3.0+ | stable | — | 插槽声明 | yes | — |
| `slots/src/03.slot-dynamic` | Vue 3.0+ | stable | — | 动态插槽名 | yes | — |
| `slots/src/04.slot-in-function-render` | Vue 3.0+ | stable | — | 函数式 render 中的插槽 | yes | — |
| `slots/src/05.slot-in-render-multi` | Vue 3.0+ | stable | — | render 函数多插槽 | yes | — |
| `slots/src/06.slot-in-render` | Vue 3.0+ | stable | — | render 函数插槽 | yes | — |
| `slots/src/07.slot-name-multi-shorthand` | Vue 3.2+ | stable | — | 具名插槽简写 #header | yes | — |
| `slots/src/08.slot-name-multi` | Vue 3.0+ | stable | — | 多具名插槽 | yes | — |
| `slots/src/09.slot-name-only` | Vue 3.0+ | stable | — | 单一具名插槽 | yes | — |
| `slots/src/10.slotscoped` | Vue 3.0+ | stable | — | 作用域插槽 | yes | — |
| `slots/src/11.slotscoped-destructuring` | Vue 3.5+ | stable (3.5+) | — | 作用域插槽解构 | yes | — |
| `slots/src/12.slotscoped-in-function-rende` | Vue 3.0+ | stable | — | 函数 render 中作用域插槽 | yes | — |
| `slots/src/13.slotscoped-in-render` | Vue 3.0+ | stable | — | render 函数作用域插槽 | yes | — |
| `slots/src/14.slotscoped-multi` | Vue 3.0+ | stable | — | 多作用域插槽 | yes | — |
| `theory/src/01.xxx` | Vue 3.x | stable | — | 理论 / 框架概述 | yes | — |
| `theory/src/02.reactive-mini` | Vue 3.x | stable | 0001-composition-api | 迷你 reactive 实现 | yes | — |
| `theory/src/03.computed-lazy` | Vue 3.x | stable | 0001-composition-api | computed 惰性求值 | yes | — |
| `theory/src/04.vnode-create` | Vue 3.x | stable | — | VNode 创建 | yes | — |
| `theory/src/05.diff-patch-keyed` | Vue 3.x | stable | — | diff/patch keyed 列表 | yes | — |
| `theory/src/06.component-mount` | Vue 3.x | stable | — | 组件挂载流程 | yes | — |
| `theory/src/07.lifecycle-dispatch` | Vue 3.x | stable | — | 生命周期调度 | yes | — |
| `theory/src/08.inject-traverse` | Vue 3.x | stable | — | provide/inject 遍历 | yes | — |
| `theory/src/09.scheduler-priority` | Vue 3.x | stable | — | 调度器优先级 | yes | — |
| `theory/src/10.nexttick-microtask` | Vue 3.x | stable | — | nextTick 与微任务 | yes | — |
| `theory/src/11.sfc-compiler-pipeline` | Vue 3.x | stable | — | SFC 编译流水线 | yes | — |
| `theory/src/12.template-optimize` | Vue 3.x | stable | — | 模板编译优化（PatchFlag / hoist） | yes | — |
| `theory/src/13.hydration-mismatch` | Vue 3.x | stable | — | 水合不匹配与处理 | yes | — |
| `vue-router/src/01.history` | Vue Router 4.x | stable | — | createWebHistory / history 模式 | yes | — |
| `vue-router/src/02.dynamic-route` | Vue Router 4.x | stable | — | 动态路由匹配 | yes | — |
| `vue-router/src/03.nested-route` | Vue Router 4.x | stable | — | 嵌套路由 | yes | — |
| `vue-router/src/04.named-route` | Vue Router 4.x | stable | — | 命名路由 | yes | — |
| `vue-router/src/05.programmatic-navigation` | Vue Router 4.x | stable | — | 编程式导航 | yes | — |
| `vue-router/src/06.router-view-slot` | Vue Router 4.x | stable | — | router-view 插槽 | yes | — |
| `vue-router/src/07.global-guard` | Vue Router 4.x | stable | — | 全局守卫 / beforeEach | yes | — |
| `vue-router/src/08.route-guard` | Vue Router 4.x | stable | — | 路由独享守卫 beforeEnter | yes | — |
| `vue-router/src/09.before-enter-guard` | Vue Router 4.x | stable | — | beforeEnter 守卫深入 | yes | — |
| `vue-router/src/10.fetch-on-navigation` | Vue Router 4.x | stable | — | 导航时数据获取 | yes | — |
| `vue-router/src/11.lazy-route` | Vue Router 4.x | stable | — | 路由懒加载 | yes | — |
| `vue-router/src/12.scroll-behavior` | Vue Router 4.x | stable | — | scrollBehavior 滚动行为 | yes | — |
| `vue-router/src/13.composable-use-route` | Vue Router 4.x | stable | — | useRoute / useRouter 组合式 API | yes | — |
| `Vue2/src/01.basic` | Vue 2.7 | maintained (Vue 2.7) | — | Vue 2 基础（仅作为对比） | yes | — |
| `Vue2/src/02.composition` | Vue 2.7 | maintained (Vue 2.7) | 0001-composition-api | Vue 2.7 移植的 Composition API | yes | — |
| `watchers/src/01.watch` | Vue 3.0+ | stable | 0001-composition-api | watch 基础 | yes | — |
| `watchers/src/02.watch-multi` | Vue 3.0+ | stable | 0001-composition-api | watch 多源 | yes | — |
| `watchers/src/03.watch-ref` | Vue 3.0+ | stable | 0001-composition-api | watch ref | yes | — |
| `watchers/src/04.watch-effect` | Vue 3.0+ | stable | 0001-composition-api | watchEffect | yes | — |
| `watchers/src/05.watch-effect-bind` | Vue 3.0+ | stable | 0001-composition-api | watchEffect 与 this 绑定 | yes | — |
| `watchers/src/06.watch-effect-debug` | Vue 3.0+ | stable | 0001-composition-api | watchEffect 调试钩子 | yes | — |
| `watchers/src/07.watch-effect-flush` | Vue 3.2+ | stable (3.2+) | 0001-composition-api | watchEffect flush 选项 | yes | — |
| `watchers/src/08.watch-effect-options` | Vue 3.0+ | stable | 0001-composition-api | watchEffect 选项 | yes | — |
| `watchers/src/09.watch-effect-runtime` | Vue 3.0+ | stable | 0001-composition-api | watchEffect 运行时 | yes | — |
| `watchers/src/10.watch-effect-stop-auto` | Vue 3.0+ | stable | 0001-composition-api | watchEffect 自动停止（组件卸载） | yes | — |
| `watchers/src/11.watch-effect-stop-manual` | Vue 3.0+ | stable | 0001-composition-api | watchEffect 手动停止 | yes | — |
| `watchers/src/12.watch-effect-validate` | Vue 3.0+ | stable | 0001-composition-api | watchEffect 资源校验与 onInvalidate | yes | — |
| `watchers/src/13.watch-effect-async-ref` | Vue 3.0+ | stable | 0001-composition-api | watchEffect 异步 ref | yes | — |
| `watchers/src/14.watch-effect-ref` | Vue 3.0+ | stable | 0001-composition-api | watchEffect + ref | yes | — |
| `watchers/src/15.watch-effect-props` | Vue 3.0+ | stable | 0001-composition-api | watchEffect + props | yes | — |

## 版本对齐依据

- Vue 3.0（2020-09）：Composition API / Teleport / Fragment / 响应式系统奠基
- Vue 3.2（2021-08）：`<script setup>` / 具名插槽 `#header` 简写 / watchEffect flush 选项
- Vue 3.3（2023-05）：defineProps / defineEmits / defineOptions / defineSlots 宏稳定
- Vue 3.4（2023-12）：defineModel / 响应式系统重写 / 同名 prop 简写
- Vue 3.5（2024-09）：响应式优化 / 具名插槽解构 / 延迟输入

## 官方文档 / RFC 索引

- [Vue 官方文档](https://vuejs.org/)
- [Vue 3 Changelog](https://github.com/vuejs/core/blob/main/CHANGELOG.md)
- [Vue RFCs](https://github.com/vuejs/rfcs)
- [Vue Router 4 文档](https://router.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
