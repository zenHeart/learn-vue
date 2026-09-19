# Vue 3 API Coverage Matrix

> 对照 [vuejs.org/api](https://vuejs.org/api/) 全部 API 章节，逐条比对 `src/learning-path/`、`src/docs/` 与 `src/examples/` 当前覆盖情况。
> 覆盖深度分为：未覆盖 / 文档中有 / 部分覆盖 / 已覆盖。
> 缺哪种深度：用法（Usage）/ 原理（Mechanism）/ 实战（Production）/ RFC 链接。
>
> Vue 版本基线：Vue 3.5.x（main 分支；本表「引入版本」取自 `packages/runtime-core/src/index.ts` 与 `compiler-sfc/src/script/` 注释）。

## 1. Application & Global API

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `createApp` | 3.0 | 已覆盖（docs/concept、concept/03.createApp） | 实战：SSR hydrate 顺序缺失 | — | `learning-path/01.concept/src/03.createApp` 加 SSR 切流例子 |
| `createSSRApp` | 3.0 | 未覆盖 | 用法 + 实战 | — | 新增 `learning-path/01.concept/src/08.createSSRApp` |
| `app.mount` | 3.0 | 已覆盖（概念章节） | 实战：多次 mount 报错路径 | — | 在 03.createApp 旁加 mini demo |
| `app.unmount` | 3.0 | 未覆盖 | 用法 | — | 在 03.createApp 旁加 |
| `app.onUnmount` | 3.5 | 未覆盖 | 用法 | — | 同上 |
| `app.component` | 3.0 | 未覆盖（文档 `provide-inject.md` 顺带提） | 用法 + 原理：全局注册 vs 局部注册 | — | 新增 `learning-path/01.concept/src/09.app-component` |
| `app.directive` | 3.0 | 未覆盖 | 用法 + 实战：自定义指令 | — | 新增 `learning-path/01.concept/src/10.app-directive` |
| `app.use` | 3.0 | 未覆盖 | 用法 + 实战：插件 install 流程 | — | 新增 `learning-path/01.concept/src/11.app-use` |
| `app.mixin` | 3.0 | 未覆盖 | 用法（官方不推荐） | — | 在 `docs/vue/composition-api.md` 增加「为何弃用」段落 |
| `app.provide` | 3.0 | 已覆盖（provide-inject.md / 06.setup-input-context） | 实战：跨多层级 | — | 已覆盖 |
| `app.runWithContext` | 3.3 | 已覆盖（composition/21.app-run-with-context） | 实战：跨 await 边界 | RFC 0021 | 已覆盖 |
| `app.version` | 3.0 | 未覆盖 | 用法 | — | 在 03.createApp demo 内一行 console.log 即可 |
| `app.config.errorHandler` | 3.0 | 已覆盖（advanced/22.app-config-handlers） | 实战：Sentry 集成 | — | 已覆盖 |
| `app.config.warnHandler` | 3.0 | 已覆盖（advanced/22.app-config-handlers） | — | — | 已覆盖 |
| `app.config.performance` | 3.0 | 未覆盖 | 用法 | — | 文档 `docs/tools/vue-source.md` 加一节 |
| `app.config.compilerOptions` | 3.0 | 未覆盖 | 用法：whitespace / comments / delimiters | — | 新增 mini demo |
| `app.config.globalProperties` | 3.0 | 已覆盖（advanced/07.global-properties） | 实战：与组合式 API 替代方案对比 | — | 已覆盖 |
| `app.config.optionMergeStrategies` | 3.0 | 未覆盖 | 用法 + 原理 | — | 在 mixin 旁补一节 |
| `app.config.idPrefix` | 3.5 | 未覆盖 | 用法 | — | 新增 mini demo |
| `app.config.throwUnhandledErrorInProduction` | 3.5 | 未覆盖 | 实战：监控接入 | — | 文档补一节 |
| `version` | 3.0 | 未覆盖 | 用法 | — | `docs/tools/vue-source.md` 注明 |
| `nextTick` | 3.0 | 已覆盖（composition/20.next-tick） | 实战：批量更新顺序 vs 微任务 | — | 已覆盖 |
| `defineComponent` | 3.0 | 文档中有（component.md） | 原理：纯类型 + 函数式组件入口 | — | 已覆盖 |
| `defineAsyncComponent` | 3.0 | 已覆盖（advanced/01.async-component） | 实战：loadingComponent / errorComponent 完整配置 | — | 已覆盖 |

## 2. Reactivity Core

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `ref` | 3.0 | 已覆盖（reactivity/02.ref） | 原理：内部 `RefImpl` 触发链路 | RFC 0035 | 已有 demo；`description.md` 可补源码片段 |
| `computed` | 3.0 | 已覆盖（reactivity/03~05） | 原理：dirty 标记、lazy 调度（见 vue-source-insights §3） | RFC 0035 | 已覆盖 |
| `reactive` | 3.0 | 已覆盖（reactivity/01.reactive、11.reactive-origin） | 原理：proxy handler 拆分、collectionHandlers | RFC 0035 | 已覆盖 |
| `readonly` | 3.0 | 已覆盖（reactivity/07.readonly） | 实战：与 `readonly()` 包装 + 解构 | — | 已覆盖 |
| `watchEffect` | 3.0 | 已覆盖（reactivity/02.watchEffect、watchers/04~15） | 原理：cleanup 注册时机（见 insights §5） | RFC 0164 | 已覆盖 |
| `watchPostEffect` | 3.5 | 已覆盖（watchers/16.flush-options-v35） | 与 `flush: 'post'` 等价性 | — | 已覆盖 |
| `watchSyncEffect` | 3.5 | 已覆盖（watchers/16.flush-options-v35） | 与 `flush: 'sync'` 等价性 | — | 已覆盖 |
| `watch` | 3.0 | 已覆盖（reactivity/01.watch、watchers/01~03） | 实战：source 为响应式数组、对象、getter | RFC 0164 | 已覆盖 |
| `onWatcherCleanup` | 3.5 | 已覆盖（watchers/16.flush-options-v35） | LIFO 顺序、同步注册 | RFC 0259 | 已覆盖 |

## 3. Reactivity Utilities

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `isRef` | 3.0 | 已覆盖（reactivity/09.isRef） | — | — | 已覆盖 |
| `unref` | 3.0 | 已覆盖（reactivity/14.ref-unboxing） | 用法 | — | 已覆盖 |
| `toRef` | 3.3 | 已覆盖（reactivity/14.ref-unboxing） | 与 `toRefs` 区别 | RFC 0232 | 已覆盖 |
| `toValue` | 3.3 | 已覆盖（composition/23.to-value-v33） | 与 unref 区别 | RFC 0232 | 已覆盖 |
| `toRefs` | 3.0 | 已覆盖（reactivity/06.toRefs） | 实战：与 `toRef` 边界（属性可缺省场景） | RFC 0165 | 已覆盖 |
| `isProxy` | 3.0 | 已覆盖（reactivity/08.isProxy） | — | — | 已覆盖 |
| `isReactive` | 3.0 | 已覆盖（reactivity/25.is-flags） | — | — | 已覆盖 |
| `isReadonly` | 3.0 | 已覆盖（reactivity/25.is-flags） | — | — | 已覆盖 |
| `isShallow` | 3.5 | 已覆盖（reactivity/25.is-flags） | — | — | 已覆盖 |

## 4. Reactivity Advanced

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `shallowRef` | 3.0 | 已覆盖（reactivity/21.reactive-vs-ref-perf、24.shallow-ref-and-trigger） | 实战：第三方大对象 | — | 已覆盖 |
| `triggerRef` | 3.0 | 已覆盖（reactivity/24.shallow-ref-and-trigger） | 用法 | — | 已覆盖 |
| `customRef` | 3.0 | 已覆盖（reactivity/14.ref-unboxing） | 实战：防抖 ref | — | 已覆盖 |
| `shallowReactive` | 3.0 | 已覆盖（reactivity/13.reactive-collection） | 嵌套 ref 行为差异 | — | 已覆盖 |
| `shallowReadonly` | 3.0 | 已覆盖（reactivity/13.reactive-collection） | — | — | 已覆盖 |
| `toRaw` | 3.0 | 已覆盖（reactivity/10.toRaw） | 原理：`ReactiveFlags.RAW` 标记 | — | 已覆盖 |
| `markRaw` | 3.0 | 已覆盖（reactivity/23.toRaw-and-markraw） | 实战：第三方实例跳过代理 | — | 已覆盖 |
| `effectScope` | 3.2 | 已覆盖（reactivity/16.effect-scope） | 实战：composable 解耦 | RFC 0041 | 已覆盖 |
| `getCurrentScope` | 3.2 | 已覆盖（reactivity/16.effect-scope） | — | RFC 0041 | 已覆盖 |
| `onScopeDispose` | 3.2 | 已覆盖（reactivity/16.effect-scope） | failSilently 参数 | RFC 0041 | 已覆盖 |

## 5. Lifecycle Hooks (Composition)

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `onMounted` | 3.0 | 文档中有（vue/setup.md） | 实战：SSR 下跳过 | — | 在 `composition/02.setup` 补一节 |
| `onUpdated` | 3.0 | 未覆盖 | 用法 | — | 新增 `composition/07.onUpdated` |
| `onUnmounted` | 3.0 | 文档中有（vue/setup.md） | 实战：解绑副作用顺序 | — | 同 onMounted |
| `onBeforeMount` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `onBeforeUpdate` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `onBeforeUnmount` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `onErrorCaptured` | 3.0 | 未覆盖（todo.md 提及） | 实战：是否捕获 setup 异步错误 | — | 新增 `composition/08.onErrorCaptured` |
| `onRenderTracked` | 3.0 | 未覆盖 | 用法 | — | 在 watchers/06.watch-effect-debug 旁补 |
| `onRenderTriggered` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `onActivated` | 3.0 | 已覆盖（advanced/23.keepalive-hooks） | 用法 | — | 已覆盖 |
| `onDeactivated` | 3.0 | 已覆盖（advanced/23.keepalive-hooks） | 用法 | — | 已覆盖 |
| `onServerPrefetch` | 3.0 | 已覆盖（composition/22.on-server-prefetch） | 实战：SSR 数据预取 | — | 已覆盖 |

## 6. Dependency Injection

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `provide` | 3.0 | 已覆盖（composition/06.setup-runtime、provide-inject.md） | — | — | 已覆盖 |
| `inject` | 3.0 | 已覆盖 | — | — | 已覆盖 |
| `hasInjectionContext` | 3.3 | 未覆盖 | 用法 | — | 在 provide-inject.md 补一节 |

## 7. Composition Helpers

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `useAttrs` | 3.0 | 已覆盖（composition/19.use-slots-attrs） | 用法 | — | 已覆盖 |
| `useSlots` | 3.0 | 已覆盖（composition/19.use-slots-attrs） | 用法 | — | 已覆盖 |
| `useModel` | 3.4 | 已覆盖（composition/18.use-model） | 与 defineModel 区别 | — | 已覆盖 |
| `useTemplateRef` | 3.5 | 已覆盖（composition/15.useTemplateRef） | 原理：`knownTemplateRefs` 检测 | — | 已覆盖 |
| `useId` | 3.5 | 已覆盖（composition/17.use-id） | SSR 行为 | RFC 0236 | 已覆盖 |

## 8. Component Instance (`$attrs`, `$refs` …)

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `$data` | 3.0 | 未覆盖 | 用法 | — | 在 concept.md 增加一节 |
| `$props` | 3.0 | 文档中有 | 实战：访问代理 vs 真实对象 | — | 在 composition/02.setup 补一节 |
| `$el` | 3.0 | 未覆盖 | 用法 | — | 在 setup.md 补一节 |
| `$options` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `$parent` | 3.0 | 未覆盖 | 用法（注意 provide/inject 替代） | — | 在 provide-inject.md 补一节 |
| `$root` | 3.0 | 未覆盖 | 用法 | — | 新增 mini demo |
| `$slots` | 3.0 | 已覆盖（slots/* 多 demo） | — | — | 已覆盖 |
| `$refs` | 3.0 | 未覆盖（render/ref 收集顺序缺失） | 实战：v-for 中顺序（见 insights §9） | — | 新增 `composition/13.template-ref` |
| `$attrs` | 3.0 | 已覆盖（setup.md、advanced/07.global-properties） | — | — | 已覆盖 |
| `$watch` | 3.0 | 未覆盖（与 watch 等价） | 实战：组件内 watch 替代方案 | — | 在 watchers 文档补一节 |
| `$emit` | 3.0 | 文档中有（event.md） | 实战：校验函数 | — | 已覆盖 |
| `$forceUpdate` | 3.0 | 未覆盖 | 用法（不推荐） | — | docs/event.md 补一节 |
| `$nextTick` | 3.0 | 文档中有（vue/concept.md） | — | — | 已覆盖 |

## 9. Built-in Directives

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `v-text` | 3.0 | 未覆盖 | 用法 | — | 新增 `learning-path/01.concept/src/14.v-text` |
| `v-html` | 3.0 | 未覆盖 | 用法 + XSS 风险 | — | 同上 |
| `v-show` | 3.0 | 未覆盖 | 用法 + 与 `v-if` 区别 | — | 同上 |
| `v-if` / `v-else` / `v-else-if` | 3.0 | 已覆盖（concept 章节、01.concept） | 原理：block tree | — | 已覆盖 |
| `v-for` | 3.0 | 已覆盖（composition/05.setup-return-render） | 实战：Map / Set 可迭代 | RFC 0039 | 已有 demo；Map/Set 例子可加 |
| `v-on` | 3.0 | 已覆盖（vue/event.md） | 实战：对象语法、修饰符全部 | — | 已覆盖 |
| `v-bind` | 3.0 | 文档中有 | 实战：`.prop`/`.attr`/`.camel`、同 shorthand（3.4+） | — | 新增 `learning-path/01.concept/src/15.v-bind` |
| `v-model` | 3.0 | 文档中有 | 实战：自定义修饰符 + defineModel | RFC 0029 | 新增 `learning-path/01.concept/src/16.v-model` |
| `v-slot` | 3.0 | 已覆盖（slots/*） | — | — | 已覆盖 |
| `v-pre` | 3.0 | 未覆盖 | 用法 | — | 在 directive.md 补一节 |
| `v-once` | 3.0 | 未覆盖 | 用法 + 与 v-memo 区别 | — | 同上 |
| `v-memo` | 3.2 | 未覆盖 | 用法 + 在 v-for 中用法 | RFC 0029 | 新增 mini demo |
| `v-cloak` | 3.0 | 未覆盖 | 用法 | — | 在 concept.md 补一节 |

## 10. Built-in Components (Special)

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `<Transition>` | 3.0 | 未覆盖 | 用法 + 实战：JS hooks、mode | — | 新增 `advanced/08.transition` |
| `<TransitionGroup>` | 3.0 | 未覆盖 | 用法 + FLIP 原理（见 insights §11） | — | 新增 `advanced/09.transition-group` |
| `<KeepAlive>` | 3.0 | 未覆盖 | 用法 + 原理：include/exclude/max LRU | RFC 0042 | 新增 `advanced/10.keep-alive` |
| `<Teleport>` | 3.0 | 已覆盖（advanced/02.component-teleport、03.teleport-modal） | 实战：`defer`（3.5+） | — | 已覆盖；可加 defer mini demo |
| `<Suspense>` | 3.0 | 未覆盖 | 实战：异步 setup、timeout | RFC 0026 | 新增 `advanced/11.suspense` |

## 11. Special Attributes

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `key` | 3.0 | 已覆盖（advanced/04.diff、05.diff-animation） | 实战：v-for 中 key 选择策略 | — | 已覆盖 |
| `ref` | 3.0 | 部分覆盖（`docs/vue/jsx.md` 提及） | 实战：v-for 中收集顺序（见 insights §9） | — | 新增 `composition/13.template-ref` |
| `is` | 3.0 | 未覆盖 | 用法 + 动态组件 | — | 新增 mini demo |

## 12. SFC `<script setup>` Macros

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `defineProps`（runtime） | 3.0 | 已覆盖（composition/03.setup-input-props） | — | — | 已覆盖 |
| `defineProps`（type-based） | 3.0 | 已覆盖 | 实战：默认值（3.4 withDefaults 弃用） | RFC 0227 | 已覆盖 |
| `defineProps` reactive destructure | 3.5 | 未覆盖 | 用法 + 原理：编译器自动 `props.` 前缀 | — | 在 03.setup-input-props 加 mini demo |
| `defineEmits` | 3.0 | 已覆盖（composition/03.setup-input-props） | — | — | 已覆盖 |
| `defineModel` | 3.4 | 未覆盖 | 实战：modifiers + transformers | RFC 0203 | 新增 `composition/14.defineModel` |
| `defineExpose` | 3.0 | 未覆盖 | 用法 + 关闭默认暴露的机制 | — | 新增 `composition/15.defineExpose` |
| `defineOptions` | 3.3 | 未覆盖 | 用法 + 编译原理（见 insights §2） | RFC 0232 | 新增 `composition/16.defineOptions` |
| `defineSlots` | 3.3 | 未覆盖 | 用法 | RFC 0232 | 新增 `composition/17.defineSlots` |
| `useSlots` / `useAttrs` | 3.0 | 已覆盖（composition/19.use-slots-attrs） | 用法 | — | 已覆盖 |
| Top-level `await` | 3.0 | 未覆盖 | 用法 + 与 Suspense 配合 | — | 新增 mini demo |
| Generics | 3.3 | 未覆盖 | 用法 | RFC 0232 | 新增 mini demo |

## 13. SFC CSS Features

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| Scoped CSS | 3.0 | 未覆盖 | 用法 + 原理：`data-v-xxx` 属性注入 | — | 新增 `learning-path/01.concept/src/17.scoped-css` |
| CSS Modules | 3.0 | 未覆盖 | 用法 + `useCssModule` | — | 同上 |
| `v-bind()` in CSS | 3.0 | 未覆盖 | 用法 | — | 同上 |

## 14. Custom Elements

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `defineCustomElement` | 3.0 | 未覆盖 | 用法 + 实战：自定义元素 + slots | — | 新增 `advanced/12.custom-element` |
| `useHost` / `useShadowRoot` | 3.0 | 未覆盖 | 用法 | — | 同上 |

## 15. Render Function

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `h` | 3.0 | 文档中有（vue/render.md、vue/jsx.md） | 实战：h 函数完整签名 | — | 已覆盖 |
| `mergeProps` | 3.0 | 未覆盖 | 用法 | — | 新增 `composition/18.mergeProps` |
| `cloneVNode` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `isVNode` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `resolveComponent` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `resolveDirective` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `withDirectives` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `withModifiers` | 3.0 | 未覆盖 | 用法 | — | 同上 |

## 16. SSR

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `renderToString` | 3.0 | 未覆盖 | 用法 + 实战 | — | 新增 `advanced/13.ssr-renderToString` |
| `renderToNodeStream` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `renderToWebStream` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `pipeToNodeWritable` / `pipeToWebWritable` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `useSSRContext` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `data-allow-mismatch` | 3.5 | 未覆盖 | 实战：文本水合不匹配 | — | 文档补一节 |

## 17. TypeScript Utility Types

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `PropType<T>` | 3.0 | 未覆盖 | 用法 | — | 在 composition/03 旁补一节 |
| `MaybeRef<T>` / `MaybeRefOrGetter<T>` | 3.3 | 未覆盖 | 用法 | — | 新增 mini demo |
| `ExtractPropTypes<T>` / `ExtractPublicPropTypes<T>` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `ComponentCustomProperties` | 3.0 | 未覆盖 | 实战：与 globalProperties 配合 | — | 文档补一节 |
| `ComponentCustomOptions` / `ComponentCustomProps` | 3.0 | 未覆盖 | 用法 | — | 文档补一节 |
| `CSSProperties` | 3.0 | 未覆盖 | 用法 | — | 文档补一节 |

## 18. Compile-Time Flags

| Flag | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `__VUE_OPTIONS_API__` | 3.0 | 未覆盖 | 实战：tree-shaking 体积影响 | — | `docs/tools/vue-source.md` 加一节 |
| `__VUE_PROD_DEVTOOLS__` | 3.0 | 未覆盖 | 用法 | — | 同上 |
| `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` | 3.5 | 未覆盖 | 实战：SSR 调试 | — | 同上 |

## 19. Custom Renderer

| API | 引入版本 | 当前覆盖 | 缺哪种深度 | 对应 RFC / Issue | 推荐补到哪个 demo |
| --- | --- | --- | --- | --- | --- |
| `createRenderer` | 3.0 | 未覆盖 | 实战：自定义渲染目标（小程序 / Canvas） | — | `docs/tools/vue-source.md` 加一节 |
| `createHydrationRenderer` | 3.0 | 未覆盖 | 用法 | — | 同上 |

---

## 摘要统计

| 类别 | 条目数 | 已覆盖 | 部分覆盖 | 未覆盖 |
| --- | --- | --- | --- | --- |
| Application / Global | 24 | 8 | 1 | 15 |
| Reactivity Core | 9 | 8 | 0 | 1 |
| Reactivity Utilities | 9 | 9 | 0 | 0 |
| Reactivity Advanced | 10 | 10 | 0 | 0 |
| Composition Lifecycle | 12 | 3 | 2 | 7 |
| Injection | 3 | 2 | 0 | 1 |
| Composition Helpers | 5 | 5 | 0 | 0 |
| Component Instance | 13 | 4 | 1 | 8 |
| Built-in Directives | 14 | 3 | 0 | 11 |
| Built-in Components | 5 | 1 | 0 | 4 |
| Special Attributes | 3 | 1 | 1 | 1 |
| SFC `<script setup>` | 11 | 4 | 0 | 7 |
| SFC CSS | 3 | 0 | 0 | 3 |
| Custom Elements | 3 | 0 | 0 | 3 |
| Render Function | 8 | 0 | 1 | 7 |
| SSR | 6 | 0 | 0 | 6 |
| TypeScript Utility Types | 7 | 0 | 0 | 7 |
| Compile-Time Flags | 3 | 0 | 0 | 3 |
| Custom Renderer | 2 | 0 | 0 | 2 |
| **总计** | **150** | **58** | **6** | **86** |

> 备注：当前站点用 `src/learning-path/<topic>/src/<NN.demo>` 路径组织 demo；文档章节 `src/docs/vue/` 多数停留在「概念笔记」层，未做「用法 + 原理 + 实战 + RFC」四级深度拆分。
> 优先级建议（按收益 / 成本比）：
> 1. 内置组件（Transition / KeepAlive / Suspense）+ 内置指令（v-bind / v-model / v-memo）。
> 2. `<script setup>` 新宏（defineModel / defineOptions / defineSlots / defineExpose）与 reactive destructure。
> 3. 进阶响应式（shallowRef / triggerRef / customRef / shallowReactive / effectScope）。
> 4. 渲染函数与 SSR。