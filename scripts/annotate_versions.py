#!/usr/bin/env python3
"""
为所有 demo 的 description.md 添加版本标注。

设计原则：
- 仅在 H1 标题之后（或空文件顶部）插入版本行块
- 已存在 `> 版本:` 标注的 demo 跳过（H1 之后或顶部均检查）
- deprecated / 内部 API 在文末追加「迁移指引」段
- 不改写正文，不删原内容
"""

import re
import sys
from pathlib import Path

ROOT = Path(r"C:/Users/cheng/code/github/learn-vue")
LP = ROOT / "src" / "learning-path"
AUDIT = ROOT / "_analysis"

# 每个 demo 对应的版本标注
# 状态: stable / 3.5+ 新增 / 3.4+ 新增 / 3.3+ 新增 / 3.2+ 新增 / deprecated / 内部 API
# deprecated / 内部 API 需要额外 migration
ANNOTATIONS: dict[str, dict] = {
    # ===== 01.concept (8 个 demo) =====
    "01.concept/src/00.basic": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "组件基础 / 模板语法 / 响应式",
    },
    "01.concept/src/01.getting-started": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "createApp 起步",
    },
    "01.concept/src/02.counter": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "ref + @click 入门",
    },
    "01.concept/src/03.createApp": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "createApp / mount",
    },
    "01.concept/src/04.basic-render": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "模板渲染 / mustache",
    },
    "01.concept/src/05.compile": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "运行时编译 vs 预编译",
    },
    "01.concept/src/06.template-expression": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "模板表达式 / 受限全局",
    },
    "01.concept/src/07.html": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "v-html 指令",
    },
    # ===== advanced (7 个 demo) =====
    "advanced/src/01.async-component": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0008-async-component",
        "concepts": "defineAsyncComponent",
    },
    "advanced/src/02.component-teleport": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0025-teleport",
        "concepts": "Teleport 组件",
    },
    "advanced/src/03.teleport-modal": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0025-teleport",
        "concepts": "Teleport 组合用法（Modal）",
    },
    "advanced/src/04.diff": {
        "version": "Vue 3.x",
        "status": "内部 API",
        "rfc": "—",
        "concepts": "Vue 内部 diff 算法",
        "migration": (
            "## 迁移指引 {#migration}\n\n"
            "`diff` 属于 Vue 运行时核心内部实现（`packages/runtime-core/src/renderer.ts`），不开放公共 API。\n"
            "如果你需要对比虚拟 DOM 变化，应改用：\n\n"
            "- `patchProp` / `patchEvent` 自定义渲染器（`createRenderer`）\n"
            "- 编译器优化标记 `BlockTree` + `PatchFlags`\n"
            "- 服务端用 `renderToString` 拿到 VNode\n\n"
            "公开 API 层面：使用 `useSSRContext()`、`<Suspense>` 等取代手动 diff。\n"
        ),
    },
    "advanced/src/05.diff-animation": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "transition-group 列表过渡动画",
    },
    "advanced/src/06.functional-component": {
        "version": "Vue 3.0+",
        "status": "deprecated",
        "rfc": "0009-functional-component",
        "concepts": "函数式组件",
        "migration": (
            "## 迁移指引 {#migration}\n\n"
            "Vue 3 中函数式组件的 `functional` 选项已被移除。\n"
            "官方推荐替换为：\n\n"
            "- **普通函数组件**：直接用 `function MyComponent(props, { slots }) { return h(...) }`，无需 functional 字段\n"
            "- **更轻量的方案**：`<script setup>` 单文件组件（性能与函数组件接近，工具链更友好）\n"
            "- **极致性能**：在 `compiler-sfc` 关闭运行时开销，用 `defineComponent` + `setup`\n\n"
            "参考：[Vue RFC 0009](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0009-functional-component.md) 说明 functional 标记在 Vue 3 不再需要。\n"
        ),
    },
    "advanced/src/07.global-properties": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "app.config.globalProperties",
    },
    # ===== component-library (8 个 demo) =====
    "component-library/src/01.provide-inject-config-provider": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "provide/inject + ConfigProvider",
    },
    "component-library/src/02.composable-use-component": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "composable useXxx 组件封装",
    },
    "component-library/src/03.theme-system-css-vars": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "主题系统与 CSS 变量",
    },
    "component-library/src/04.use-form-item-context": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "Form 表单上下文注入",
    },
    "component-library/src/05.button-as": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "PolymorphicComponent 多态组件",
    },
    "component-library/src/06.virtualized-list": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "虚拟滚动列表",
    },
    "component-library/src/07.tree-shaking-style-import": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "按需引入样式 / tree-shaking",
    },
    "component-library/src/08.ssr-component-library": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "组件库 SSR 适配",
    },
    # ===== engineering (10 个 demo) =====
    "engineering/src/01.monorepo-vue-pnpm": {
        "version": "pnpm 8.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "Vue + pnpm monorepo 工程化",
    },
    "engineering/src/02.eslint-config-typescript-vue": {
        "version": "eslint-plugin-vue 9.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "ESLint + TypeScript + Vue 配置",
    },
    "engineering/src/03.vitest-vue-snapshot": {
        "version": "Vitest 1.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "Vitest 组件快照测试",
    },
    "engineering/src/04.git-hooks-husky-lint": {
        "version": "husky 8.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "git hooks + husky + lint-staged",
    },
    "engineering/src/05.ci-caching-pnpm": {
        "version": "CI 通用",
        "status": "stable",
        "rfc": "—",
        "concepts": "CI 缓存 pnpm store",
    },
    "engineering/src/06.vscode-settings-recommended": {
        "version": "VS Code",
        "status": "stable",
        "rfc": "—",
        "concepts": "VS Code 推荐设置",
    },
    "engineering/src/07.vite-plugin-order": {
        "version": "Vite 5+",
        "status": "stable",
        "rfc": "—",
        "concepts": "Vite 插件执行顺序",
    },
    "engineering/src/08.path-aliases": {
        "version": "Vite 5+ / TS",
        "status": "stable",
        "rfc": "—",
        "concepts": "路径别名配置",
    },
    "engineering/src/09.layer-based-architecture": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "分层架构（base/features/widgets）",
    },
    "engineering/src/10.component-design-patterns": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "组件设计模式",
    },
    # ===== composition (10 个 demo) =====
    "composition/src/01.hooks": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "Composition API 钩子函数",
    },
    "composition/src/02.setup": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "setup() 函数",
    },
    "composition/src/03.setup-input-props": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "setup 中访问 props",
    },
    "composition/src/04.setup-input-context": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "setup context（attrs/slots/emit/expose）",
    },
    "composition/src/05.setup-return-render": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "setup 返回渲染函数",
    },
    "composition/src/06.setup-runtime": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "setup 运行时选项",
    },
    "composition/src/07.defineprops-default": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0003-script-setup",
        "concepts": "defineProps 类型与默认值",
    },
    "composition/src/08.defineemits-validation": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0003-script-setup",
        "concepts": "defineEmits 事件校验",
    },
    "composition/src/09.defineModel": {
        "version": "Vue 3.4+",
        "status": "stable (3.4+)",
        "rfc": "0008-define-model",
        "concepts": "defineModel 双向绑定宏",
    },
    "composition/src/10.defineOptions": {
        "version": "Vue 3.3+",
        "status": "stable (3.3+)",
        "rfc": "0003-script-setup",
        "concepts": "defineOptions 组件选项宏",
    },
    "composition/src/11.defineSlots": {
        "version": "Vue 3.3+",
        "status": "stable (3.3+)",
        "rfc": "0003-script-setup",
        "concepts": "defineSlots 插槽类型宏",
    },
    "composition/src/12.provide-inject-typed": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "provide/inject 类型化",
    },
    "composition/src/13.provide-inject-as-state": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "provide/inject 替代全局状态",
    },
    "composition/src/14.lifecycles-deep": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "生命周期钩子深入",
    },
    # ===== ecosystem (4 个 demo) =====
    "ecosystem/src/01.vite-sfc-on-demand": {
        "version": "Vite 5+",
        "status": "stable",
        "rfc": "—",
        "concepts": "Vite 按需加载 SFC",
    },
    "ecosystem/src/02.unplugin-vue-components": {
        "version": "unplugin-vue-components 0.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "unplugin-vue-components 自动注册",
    },
    "ecosystem/src/03.vitepress-theme": {
        "version": "VitePress 1.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "VitePress 自定义主题",
    },
    "ecosystem/src/04.vue-i18n": {
        "version": "vue-i18n 9.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "vue-i18n 国际化",
    },
    "ecosystem/src/05.unhead-usehead": {
        "version": "unhead 1.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "useHead 文档元信息",
    },
    "ecosystem/src/06.vueuse-core": {
        "version": "VueUse 10.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "VueUse 组合式工具集",
    },
    "ecosystem/src/07.vitest-component": {
        "version": "Vitest 1.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "Vitest 组件测试",
    },
    "ecosystem/src/08.vitest-reactivity": {
        "version": "Vitest 1.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "Vitest 响应式单元测试",
    },
    "ecosystem/src/09.cypress-vue": {
        "version": "Cypress 12.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "Cypress 端到端测试",
    },
    "ecosystem/src/10.playwright-vue": {
        "version": "Playwright 1.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "Playwright 端到端测试",
    },
    "ecosystem/src/11.eslint-vue": {
        "version": "eslint-plugin-vue 9.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "ESLint Vue 静态检查",
    },
    "ecosystem/src/12.unplugin-auto-import": {
        "version": "unplugin-auto-import 0.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "unplugin-auto-import 自动导入",
    },
    "ecosystem/src/13.vite-ssr": {
        "version": "Vite SSR",
        "status": "stable",
        "rfc": "—",
        "concepts": "Vite SSR 服务端渲染",
    },
    "ecosystem/src/14.bundle-analyze": {
        "version": "rollup-plugin-visualizer",
        "status": "stable",
        "rfc": "—",
        "concepts": "产物体积可视化分析",
    },
    # ===== performance (1 个 demo) =====
    "performance/src/01.reactive-spread-projection": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "响应式 spread 投影性能",
    },
    "performance/src/02.reactive-overhead-bench": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "响应式开销基准",
    },
    "performance/src/03.computed-memo-vs-getter": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "computed memo vs getter 性能",
    },
    "performance/src/04.v-memo-list": {
        "version": "Vue 3.2+",
        "status": "stable (3.2+)",
        "rfc": "—",
        "concepts": "v-memo 列表性能",
    },
    "performance/src/05.keepalive-include-excludes": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "KeepAlive include/excludes",
    },
    "performance/src/06.bundle-analyze-demo": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "产物体积分析",
    },
    "performance/src/07.virtualized-list-perf": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "虚拟列表性能",
    },
    "performance/src/08.ssr-vs-csr": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "SSR vs CSR 性能对比",
    },
    "performance/src/09.reactive-deep-vs-shallow-bench": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "reactive 深浅代理性能基准",
    },
    "performance/src/10.scheduler-batch": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "调度器批处理",
    },
    "performance/src/11.nexttick-vs-raf": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "nextTick vs requestAnimationFrame",
    },
    "performance/src/12.watch-effect-flush-options": {
        "version": "Vue 3.2+",
        "status": "stable (3.2+)",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect flush 选项深入",
    },
    "performance/src/13.reactive-vs-immutable": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "reactive vs Immutable.js 性能对比",
    },
    # ===== pinia (1 个 demo) =====
    "pinia/src/01.basic": {
        "version": "Pinia 2.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "Pinia 基础",
    },
    "pinia/src/02.setup-store": {
        "version": "Pinia 2.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "setup 函数式 store",
    },
    "pinia/src/03.store-state-and-actions": {
        "version": "Pinia 2.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "store 的 state 与 actions",
    },
    "pinia/src/04.getters-and-computed": {
        "version": "Pinia 2.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "getters 等价于 computed",
    },
    "pinia/src/05.actions-async": {
        "version": "Pinia 2.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "actions 中的异步处理",
    },
    "pinia/src/06.subscribe-and-watch": {
        "version": "Pinia 2.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "$subscribe 监听 store 变化",
    },
    "pinia/src/07.cross-store-usage": {
        "version": "Pinia 2.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "跨 store 引用与组合",
    },
    "pinia/src/08.pinia-plugin": {
        "version": "Pinia 2.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "Pinia 插件机制",
    },
    "pinia/src/09.options-vs-setup": {
        "version": "Pinia 2.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "Options store vs setup store",
    },
    "pinia/src/10.pinia-and-vuerouter": {
        "version": "Pinia 2.x + Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "Pinia + Vue Router 组合",
    },
    "pinia/src/11.testing-pinia-store": {
        "version": "Pinia 2.x + Vitest 1.x+",
        "status": "stable",
        "rfc": "—",
        "concepts": "Pinia store 单元测试",
    },
    # ===== reactivity (23 个 demo) =====
    "reactivity/src/01.reactive": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "reactive()",
    },
    "reactivity/src/01.watch": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watch 基础",
    },
    "reactivity/src/02.ref": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "ref()",
    },
    "reactivity/src/02.watchEffect": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect",
    },
    "reactivity/src/03.computed": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "computed()",
    },
    "reactivity/src/04.computed-accessor": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "computed getter/setter",
    },
    "reactivity/src/05.computed-state": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "computed 状态",
    },
    "reactivity/src/06.toRefs": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "toRefs / toRef",
    },
    "reactivity/src/07.readonly": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "readonly / shallowReadonly",
    },
    "reactivity/src/08.isProxy": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "isProxy / isReactive",
    },
    "reactivity/src/09.isRef": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "isRef",
    },
    "reactivity/src/10.toRaw": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "toRaw / markRaw",
    },
    "reactivity/src/11.reactive-origin": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "reactive 起源与 Proxy",
    },
    "reactivity/src/12.reactive-deep-proxy": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0001-composition-api, 0003-data-option",
        "concepts": "reactive 深度代理",
    },
    "reactivity/src/13.reactive-collection": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "reactive Map / Set / WeakMap",
    },
    "reactivity/src/14.ref-unboxing": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "ref 自动解包",
    },
    "reactivity/src/15.computed-dirty-and-cache": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "computed 脏检查与缓存",
    },
    "reactivity/src/16.effect-scope": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "effectScope / getCurrentScope",
    },
    "reactivity/src/17.watch-vs-watcheffect": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watch vs watchEffect",
    },
    "reactivity/src/18.watch-source-form": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watch 数据源形态",
    },
    "reactivity/src/19.scheduler-and-queue": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "调度器与任务队列",
    },
    "reactivity/src/20.ontrack-debug": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "onTrack / onTrigger 调试",
    },
    "reactivity/src/21.reactive-vs-ref-perf": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "reactive vs ref 性能对比",
    },
    "reactivity/src/22.ssr-reactivity": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "SSR 响应式",
    },
    "reactivity/src/23.toRaw-and-markraw": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "toRaw / markRaw 深入",
    },
    # ===== slots (14 个 demo) =====
    "slots/src/01.slot-default": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "默认插槽",
    },
    "slots/src/02.slot-declare": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "插槽声明",
    },
    "slots/src/03.slot-dynamic": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "动态插槽名",
    },
    "slots/src/04.slot-in-function-render": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "函数式 render 中的插槽",
    },
    "slots/src/05.slot-in-render-multi": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "render 函数多插槽",
    },
    "slots/src/06.slot-in-render": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "render 函数插槽",
    },
    "slots/src/07.slot-name-multi-shorthand": {
        "version": "Vue 3.2+",
        "status": "stable",
        "rfc": "—",
        "concepts": "具名插槽简写 #header",
    },
    "slots/src/08.slot-name-multi": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "多具名插槽",
    },
    "slots/src/09.slot-name-only": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "单一具名插槽",
    },
    "slots/src/10.slotscoped": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "作用域插槽",
    },
    "slots/src/11.slotscoped-destructuring": {
        "version": "Vue 3.5+",
        "status": "stable (3.5+)",
        "rfc": "—",
        "concepts": "作用域插槽解构",
    },
    "slots/src/12.slotscoped-in-function-rende": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "函数 render 中作用域插槽",
    },
    "slots/src/13.slotscoped-in-render": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "render 函数作用域插槽",
    },
    "slots/src/14.slotscoped-multi": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "—",
        "concepts": "多作用域插槽",
    },
    # ===== theory (5 个 demo) =====
    "theory/src/01.xxx": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "理论 / 框架概述",
    },
    "theory/src/02.reactive-mini": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "迷你 reactive 实现",
    },
    "theory/src/03.computed-lazy": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "computed 惰性求值",
    },
    "theory/src/04.vnode-create": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "VNode 创建",
    },
    "theory/src/05.diff-patch-keyed": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "diff/patch keyed 列表",
    },
    "theory/src/06.component-mount": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "组件挂载流程",
    },
    "theory/src/07.lifecycle-dispatch": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "生命周期调度",
    },
    "theory/src/08.inject-traverse": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "provide/inject 遍历",
    },
    "theory/src/09.scheduler-priority": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "调度器优先级",
    },
    "theory/src/10.nexttick-microtask": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "nextTick 与微任务",
    },
    "theory/src/11.sfc-compiler-pipeline": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "SFC 编译流水线",
    },
    "theory/src/12.template-optimize": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "模板编译优化（PatchFlag / hoist）",
    },
    "theory/src/13.hydration-mismatch": {
        "version": "Vue 3.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "水合不匹配与处理",
    },
    # ===== Vue2 (2 个 demo) =====
    "Vue2/src/01.basic": {
        "version": "Vue 2.7",
        "status": "maintained (Vue 2.7)",
        "rfc": "—",
        "concepts": "Vue 2 基础（仅作为对比）",
    },
    "Vue2/src/02.composition": {
        "version": "Vue 2.7",
        "status": "maintained (Vue 2.7)",
        "rfc": "0001-composition-api",
        "concepts": "Vue 2.7 移植的 Composition API",
    },
    # ===== vue-router (7 个 demo) =====
    "vue-router/src/01.history": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "createWebHistory / history 模式",
    },
    "vue-router/src/02.dynamic-route": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "动态路由匹配",
    },
    "vue-router/src/03.nested-route": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "嵌套路由",
    },
    "vue-router/src/04.named-route": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "命名路由",
    },
    "vue-router/src/05.programmatic-navigation": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "编程式导航",
    },
    "vue-router/src/06.router-view-slot": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "router-view 插槽",
    },
    "vue-router/src/07.global-guard": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "全局守卫 / beforeEach",
    },
    "vue-router/src/08.route-guard": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "路由独享守卫 beforeEnter",
    },
    "vue-router/src/09.before-enter-guard": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "beforeEnter 守卫深入",
    },
    "vue-router/src/10.fetch-on-navigation": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "导航时数据获取",
    },
    "vue-router/src/11.lazy-route": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "路由懒加载",
    },
    "vue-router/src/12.scroll-behavior": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "scrollBehavior 滚动行为",
    },
    "vue-router/src/13.composable-use-route": {
        "version": "Vue Router 4.x",
        "status": "stable",
        "rfc": "—",
        "concepts": "useRoute / useRouter 组合式 API",
    },
    # ===== watchers (15 个 demo) =====
    "watchers/src/01.watch": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watch 基础",
    },
    "watchers/src/02.watch-multi": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watch 多源",
    },
    "watchers/src/03.watch-ref": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watch ref",
    },
    "watchers/src/04.watch-effect": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect",
    },
    "watchers/src/05.watch-effect-bind": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect 与 this 绑定",
    },
    "watchers/src/06.watch-effect-debug": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect 调试钩子",
    },
    "watchers/src/07.watch-effect-flush": {
        "version": "Vue 3.2+",
        "status": "stable (3.2+)",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect flush 选项",
    },
    "watchers/src/08.watch-effect-options": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect 选项",
    },
    "watchers/src/09.watch-effect-runtime": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect 运行时",
    },
    "watchers/src/10.watch-effect-stop-auto": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect 自动停止（组件卸载）",
    },
    "watchers/src/11.watch-effect-stop-manual": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect 手动停止",
    },
    "watchers/src/12.watch-effect-validate": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect 资源校验与 onInvalidate",
    },
    "watchers/src/13.watch-effect-async-ref": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect 异步 ref",
    },
    "watchers/src/14.watch-effect-ref": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect + ref",
    },
    "watchers/src/15.watch-effect-props": {
        "version": "Vue 3.0+",
        "status": "stable",
        "rfc": "0001-composition-api",
        "concepts": "watchEffect + props",
    },
}


def find_demo_paths() -> list[Path]:
    """找到所有 demo 的 description.md（排除 _hint）。"""
    return sorted(p for p in LP.glob("*/src/*/description.md") if "_hint" not in str(p))


def relative_key(path: Path) -> str:
    """根据绝对路径反推出 ANNOTATIONS 中的 key。"""
    rel = path.relative_to(LP).parent
    return str(rel).replace("\\", "/")


def has_annotation(text: str) -> bool:
    """检测是否已有 `> 版本:` 标注。"""
    return bool(re.search(r"^>\s*版本[:：]", text, re.MULTILINE))


def build_annotation_block(meta: dict) -> str:
    """构建 `> 版本: ...` 单行标注块。"""
    version = meta["version"]
    status = meta["status"]
    rfc = meta["rfc"]
    concepts = meta["concepts"]
    return f"> 版本: {version} | RFC: {rfc} | 状态: {status} | 概念: {concepts}\n\n"


def insert_annotation(path: Path, meta: dict) -> str:
    """在 H1 标题之前插入版本标注块；返回操作描述。"""
    text = path.read_text(encoding="utf-8")
    if has_annotation(text):
        return "skip (已标注)"

    block = build_annotation_block(meta)
    lines = text.splitlines(keepends=True)

    # 找到第一个 H1 行（以 `# ` 开头）
    h1_idx = None
    for i, line in enumerate(lines):
        if re.match(r"^#\s", line):
            h1_idx = i
            break

    if h1_idx is None:
        # 没有 H1：插到顶部（保留空文件后续空行）
        new_text = block + text
    else:
        new_text = "".join(lines[:h1_idx]) + block + "".join(lines[h1_idx:])

    path.write_text(new_text, encoding="utf-8")
    return "insert"


def append_migration(path: Path, meta: dict) -> str:
    """对 deprecated / 内部 API 的 demo 追加迁移指引段。"""
    if "migration" not in meta:
        return "no-migration"
    text = path.read_text(encoding="utf-8")
    if "{#migration}" in text:
        return "skip (已含迁移段)"
    # 追加到文末，保持一个空行
    if not text.endswith("\n"):
        text += "\n"
    text += "\n" + meta["migration"]
    path.write_text(text, encoding="utf-8")
    return "append-migration"


def main() -> int:
    audit_rows: list[dict] = []
    annotated = 0
    skipped = 0
    deprecated = 0
    internal_api = 0
    migration_total = 0
    missing_mapping: list[str] = []

    for desc_path in find_demo_paths():
        key = relative_key(desc_path)
        meta = ANNOTATIONS.get(key)
        if meta is None:
            missing_mapping.append(key)
            audit_rows.append({
                "key": key,
                "version": "—",
                "status": "—",
                "rfc": "—",
                "concepts": "—",
                "annotation": "no",
                "migration": "—",
            })
            continue

        action = insert_annotation(desc_path, meta)
        if action.startswith("insert"):
            annotated += 1
        else:
            skipped += 1

        m_action = append_migration(desc_path, meta)
        if m_action == "append-migration":
            migration_total += 1

        if meta["status"] == "deprecated":
            deprecated += 1
        if meta["status"] == "内部 API":
            internal_api += 1

        # 重新读取真实状态
        final_text = desc_path.read_text(encoding="utf-8")
        has_anno = has_annotation(final_text)
        has_mig = "{#migration}" in final_text
        if has_mig:
            migration_total += 1

        audit_rows.append({
            "key": key,
            "version": meta["version"],
            "status": meta["status"],
            "rfc": meta["rfc"],
            "concepts": meta["concepts"],
            "annotation": "yes" if has_anno else "no",
            "migration": "yes" if has_mig else "—",
        })

    # 输出审计报告
    AUDIT.mkdir(parents=True, exist_ok=True)
    audit_path = AUDIT / "version-audit.md"
    lines: list[str] = []
    lines.append("# 版本与废弃状态审计\n\n")
    lines.append(f"- 总 demo 数：**{len(audit_rows)}**\n")
    lines.append(f"- 已标注（最终）数：**{annotated + skipped}**\n")
    lines.append(f"- 本轮新增标注数：**{annotated}**\n")
    lines.append(f"- 已有标注（跳过）数：**{skipped}**\n")
    lines.append(f"- 未标注（缺映射）数：**{len(missing_mapping)}**\n")
    lines.append(f"- deprecated 数：**{deprecated}**\n")
    lines.append(f"- 内部 API 数：**{internal_api}**\n")
    lines.append(f"- 含迁移指引的 demo 数：**{migration_total}**\n\n")
    lines.append("## demo 标注清单\n\n")
    lines.append("| 路径 | 版本 | 状态 | RFC | 概念 | 标注 | 迁移 |\n")
    lines.append("| --- | --- | --- | --- | --- | --- | --- |\n")
    for row in audit_rows:
        lines.append(
            f"| `{row['key']}` | {row['version']} | {row['status']} | {row['rfc']} | {row['concepts']} | {row['annotation']} | {row['migration']} |\n"
        )
    if missing_mapping:
        lines.append("\n## 未映射 demo（需要补全 ANNOTATIONS）\n\n")
        for k in missing_mapping:
            lines.append(f"- `{k}`\n")
    lines.append("\n## 版本对齐依据\n\n")
    lines.append("- Vue 3.0（2020-09）：Composition API / Teleport / Fragment / 响应式系统奠基\n")
    lines.append("- Vue 3.2（2021-08）：`<script setup>` / 具名插槽 `#header` 简写 / watchEffect flush 选项\n")
    lines.append("- Vue 3.3（2023-05）：defineProps / defineEmits / defineOptions / defineSlots 宏稳定\n")
    lines.append("- Vue 3.4（2023-12）：defineModel / 响应式系统重写 / 同名 prop 简写\n")
    lines.append("- Vue 3.5（2024-09）：响应式优化 / 具名插槽解构 / 延迟输入\n\n")
    lines.append("## 官方文档 / RFC 索引\n\n")
    lines.append("- [Vue 官方文档](https://vuejs.org/)\n")
    lines.append("- [Vue 3 Changelog](https://github.com/vuejs/core/blob/main/CHANGELOG.md)\n")
    lines.append("- [Vue RFCs](https://github.com/vuejs/rfcs)\n")
    lines.append("- [Vue Router 4 文档](https://router.vuejs.org/)\n")
    lines.append("- [Pinia 文档](https://pinia.vuejs.org/)\n")

    audit_path.write_text("".join(lines), encoding="utf-8")

    # 控制台摘要
    print(f"总 demo 数: {len(audit_rows)}")
    print(f"已标注 demo 数: {annotated + skipped}")
    print(f"本轮新增标注: {annotated}")
    print(f"已有标注（跳过）: {skipped}")
    print(f"未映射 demo: {len(missing_mapping)}")
    print(f"deprecated: {deprecated}")
    print(f"内部 API: {internal_api}")
    print(f"含迁移指引 demo 数: {migration_total}")
    print(f"审计报告: {audit_path}")
    if missing_mapping:
        print("\n未映射 demo:")
        for k in missing_mapping:
            print(f"  - {k}")
    return 0


if __name__ == "__main__":
    sys.exit(main())