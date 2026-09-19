> 版本: Vue 3.x | 源码: packages/compiler-sfc/src/index.ts, packages/compiler-core/src/compile.ts | 难度: 中等

# 11 · SFC 编译流水线：parse → transform → generate

## 原理是什么

单文件组件 (SFC, `.vue`) 由 `<template>`、`<script>`、`<style>` 三个块组成，分别由三套编译器处理：

- `@vue/compiler-dom` / `@vue/compiler-ssr`：处理 template → render function（AST → 转换 → codegen）；
- `@vue/compiler-sfc`：用 `@vue/compiler-sfc` 的 parse 把 SFC 拆为 descriptor（template、script、styles、customBlocks），再把 script 中 `<script setup>` 的特殊语法转换为 `setup()` 函数；
- `<script setup>` 的宏（`defineProps`、`defineEmits`、`defineExpose`、`withDefaults` 等）由 `compileScript` 调用 `transformAssetUrls`/`transformDefinePropsCall` 等插件在 transform 阶段重写。

完整流水线：`SFC source → parseSFC → compileScript + compileTemplate + compileStyle → bundle`。

## 一步步走读源码

源码定位：

- `packages/compiler-sfc/src/parse.ts` 第 80-180 行：`parseSFC` 把 source 切成 blocks。
- `packages/compiler-sfc/src/compileScript.ts`：`<script setup>` 的核心。
- `packages/compiler-core/src/compile.ts` 第 50-100 行：`baseCompile(template, options)`。
- `packages/compiler-core/src/parse.ts` 第 200-260 行：template AST 构造。
- `packages/compiler-core/src/transform.ts` / `transforms/`：transform 阶段。
- `packages/compiler-core/src/codegen.ts` 第 80-160 行：render function 字符串生成。

关键片段：

```ts
// compiler-sfc/src/compileScript.ts
export function compileScript(sfc, options) {
  const { script, scriptSetup, bindings } = resolveScriptType(sfc, options)
  const ctx = new ScriptCompileContext(sfc, options, bindings)
  // 重写 <script setup> 的 defineProps / defineEmits 等宏
  for (const macro of MACROS) {
    if (macro === 'defineProps') processDefineProps(ctx)
    else if (macro === 'defineEmits') processDefineEmits(ctx)
    // ...
  }
  return { ...ctx, bindings, scriptAst }
}

// compiler-core/src/compile.ts
export function baseCompile(template, options = {}) {
  const ast = parse(template)                 // 1. parse
  transform(ast, { ...options, nodeTransforms: [...transforms] }) // 2. transform
  const code = generate(ast, options)         // 3. generate
  return { ast, code }
}
```

template AST 转 render function 的过程（codegen 节选）：

```ts
// 对应 <div :class="cls">{{ msg }}</div>
function render(_ctx, _cache) {
  return _openBlock(), _createElementBlock("div", {
    class: _normalizeClass(_ctx.cls)
  }, _toDisplayString(_ctx.msg), 1 /* TEXT */)
}
```

## 为何这样设计

- **三段式**：每个阶段职责单一：parse 产出 AST、transform 应用优化、generate 输出字符串。
- **AST 是中间表示**：transform 可以多次遍历、组合优化（如 hoistStatic + cacheStringify），生成可以输出多种形态（render / SSR / dev mode）。
- **AST 解耦**：模板和 JS 各自独立编译后通过 `bindings` 桥接（如 `<script setup>` 中 `count` 引用模板里的 `count`）。

## 性能与权衡

- 编译时成本只发生一次（开发期 vite/webpack 缓存），不影响运行时；
- AST 大小约为模板字符数的 2-3 倍，但通过 hoist 静态节点可大幅缩减 render function 体积。

## Vue 官方延伸阅读

- 官方文档 template-explorer: <https://template-explorer.vuejs.org/>
- 编译流程: <https://cn.vuejs.org/guide/extras/rendering-mechanism.html#compiler>
- 源码: <https://github.com/vuejs/core/tree/main/packages/compiler-sfc>
- 源码: <https://github.com/vuejs/core/tree/main/packages/compiler-core>

## 对应 RFC

RFC 28: Optimized Compiler Output（编译期优化的整体目标）
RFC 227: `<script setup>`（defineProps/defineEmits 等宏的提案）

## 延伸：可手写极简版本验证

demo `11.sfc-compiler-pipeline/App/App.vue` 用伪代码模拟 parse → transform → generate，并把每一步产物可视化。

## 参考资料

- 《Vue.js 设计与实现》霍春阳，第 15 章「编译器核心技术」、第 16 章「解析器」、第 17 章「转换器」、第 18 章「生成器」
- 《Vue 技术揭秘》compiler 篇 <https://ustbhuangyi.github.io/vue-analysis/vue3/compiler.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/compiler-core/src/compile.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：defineOptions / defineSlots 宏的编译器展开](_analysis/vue-source-insights.md#defineoptions--defineslots宏的编译器展开) | `packages/compiler-sfc/src/script/defineOptions.ts:18-72` 引用
- [Vue 源码洞察：patchProp 中 v-model 监听被忽略](_analysis/vue-source-insights.md#patchprop中v-model监听被忽略) | `packages/runtime-dom/src/patchProp.ts:28-32` 引用
