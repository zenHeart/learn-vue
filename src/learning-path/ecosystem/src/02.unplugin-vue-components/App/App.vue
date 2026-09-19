<script setup>
import { ref } from 'vue'

// 在真实项目里，这些 import 会被 unplugin-vue-components 自动生成：
// import { ElButton } from 'element-plus'
// import { NButton } from 'naive-ui'
// 这里手动 import 是为了让 REPL 能跑通。

const tags = ['ElButton', 'NButton', 'ACard']

// 模拟 components.d.ts 自动生成结果
const dtsPreview = [
  `declare module 'vue' {`,
  `  export interface GlobalComponents {`,
  `    ElButton: typeof import('element-plus')['ElButton']`,
  `    NButton: typeof import('naive-ui')['NButton']`,
  `    ACard: typeof import('./components/ACard.vue')['default']`,
  `  }`,
  `}`,
  `export {};`,
].join('\n')

const clicked = ref(0)
</script>

<template>
  <div class="card">
    <h2>unplugin-vue-components 自动注册</h2>
    <p class="hint">模板里直接写 <code>&lt;ElButton&gt;</code>，插件自动注入 import。</p>

    <div class="row">
      <button class="primary" @click="clicked++">ElButton (auto-imported, click {{ clicked }})</button>
      <button class="success">NButton</button>
    </div>

    <h3>自动生成的 components.d.ts</h3>
    <pre>{{ dtsPreview }}</pre>

    <h3>扫描到的标签</h3>
    <div class="chips">
      <span v-for="t in tags" :key="t" class="chip">{{ t }}</span>
    </div>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 480px; }
.card h2 { margin: 0 0 6px; font-size: 1.05rem; }
.card h3 { margin: 12px 0 6px; font-size: 0.9rem; }
.hint { font-size: 0.82rem; color: #666; margin: 0 0 10px; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.82rem; }
.row { display: flex; gap: 8px; margin-bottom: 12px; }
button { padding: 6px 12px; border-radius: 6px; border: 1px solid #ccc; cursor: pointer; font-size: 0.85rem; background: #fff; }
button.primary { background: #409eff; color: #fff; border-color: #409eff; }
button.success { background: #18a058; color: #fff; border-color: #18a058; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 0.78rem; overflow-x: auto; line-height: 1.5; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { background: #f0f9eb; color: #18a058; border: 1px solid #b7eb8f; border-radius: 999px; padding: 2px 10px; font-size: 0.78rem; }
</style>
