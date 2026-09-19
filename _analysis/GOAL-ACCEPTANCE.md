# Goal acceptance criteria

本文件说明如何验证「从零到专家」学习站点目标是否达成。

## 覆盖矩阵

站点应该覆盖 Vue 3.5 全部公开 API 与生态工具链关键概念。

按 `_analysis/api-coverage-matrix.md`（由并行 agent 1 产出）逐条核对：

- [ ] 全局 API：createApp / defineComponent / defineAsyncComponent / defineCustomElement / resolveComponent / resolveDirective / 等
- [ ] 响应式 API：ref / reactive / computed / watch / watchEffect / effectScope / customRef / shallowRef / shallowReactive / toRaw / markRaw / 等
- [ ] 生命周期：onMounted / onBeforeMount / onUpdated / 等所有 `on*`
- [ ] 组件实例：$attrs / $emit / $forceUpdate / $nextTick / $watch / $refs / 等
- [ ] 内置组件：Transition / TransitionGroup / KeepAlive / Teleport / Suspense
- [ ] 指令：v-if / v-for / v-show / v-model / v-on / v-bind / v-slot / v-memo / 自定义指令
- [ ] Special Attributes: key / ref / is / 等
- [ ] 生态：Vue Router / Pinia / Vite / VitePress / Vitest / VueUse / unplugin-vue-components
- [ ] 主流组件库模式：Element Plus / Naive UI / Ant Design Vue / PrimeVue
- [ ] 工程化：monorepo / lint / test / CI
- [ ] 性能：响应式开销 / 虚拟滚动 / KeepAlive / SSR / bundle 分析
- [ ] 踩坑：10+ 常见反模式与修复

## 演示质量

每个 demo 必须满足：

- [ ] description.md ≥ 300 字
- [ ] App/App.vue 是 Vue 3 SFC（`<script setup lang="ts">`）
- [ ] description.md 顶部含「版本」「状态」「延伸阅读」
- [ ] App.vue 运行结果可视化（输出状态值、性能数字、log 列表等）
- [ ] 不在 computed getter 内修改 ref
- [ ] 不含 banned content（公司名、内部路径、Profile JSON）
- [ ] 可被 REPL 加载（不引用未声明依赖）

## 教学路径

- [ ] 入门 → 响应式 → 组件 → 进阶 → 生态实战 五个递进阶段都有覆盖
- [ ] 每个 demo 引用 Vue 官方文档章节作为延伸阅读
- [ ] 每个 demo 引用对应 RFC（如果存在）
- [ ] 每个 demo 引用 Vue 源码位置（file:line）

## 实战与踩坑

- [ ] 至少 10 个实战 demo（覆盖 Element Plus / Pinia / Vue Router 等主流组件库 / 工具）
- [ ] 至少 10 个踩坑 demo（每个都有问题版本 + 修复版本对照）

## 工程化

- [ ] `pnpm typecheck` 通过
- [ ] `pnpm build` 通过
- [ ] `node scripts/verify-learning-paths.mjs` 通过
- [ ] `node scripts/verify-docs.mjs` 通过
- [ ] 部署到 vue.zenheart.site 可访问