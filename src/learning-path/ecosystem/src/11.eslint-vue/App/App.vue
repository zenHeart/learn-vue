<script setup>
const ruleSamples = [
  {
    rule: 'vue/no-v-html',
    bad: '<div v-html="userInput"></div>',
    good: '<div>{{ userInput }}</div>',
    reason: 'XSS 风险',
  },
  {
    rule: 'vue/multi-word-component-names',
    bad: 'export default { name: "Card" }',
    good: 'export default { name: "AppCard" }',
    reason: '防止与原生标签冲突',
  },
  {
    rule: 'vue/no-use-v-if-with-v-for',
    bad: '<li v-for="x in list" v-if="x.ok">',
    good: '<li v-for="x in filteredList">',
    reason: 'v-for 优先级更高，常见性能与逻辑 bug',
  },
  {
    rule: 'vue/require-default-prop',
    bad: 'props: { size: String }',
    good: 'props: { size: { type: String, default: "md" } }',
    reason: '缺省值明确，调用方无需处理 undefined',
  },
]

const output = ruleSamples
  .map((s) => `error  ${s.rule}  ${s.bad}  →  ${s.good}`)
  .join('\n')
</script>

<template>
  <div class="card">
    <h2>eslint-plugin-vue 规则样例</h2>
    <p class="hint">展示典型 lint 错误与修复。</p>

    <pre>{{ output }}</pre>

    <h3>推荐链路</h3>
    <ol class="list">
      <li v-for="s in ruleSamples" :key="s.rule">
        <code>{{ s.rule }}</code> — {{ s.reason }}
      </li>
    </ol>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 520px; }
.card h2 { margin: 0 0 6px; font-size: 1rem; }
.card h3 { margin: 12px 0 6px; font-size: 0.9rem; }
.hint { font-size: 0.8rem; color: #666; margin: 0 0 10px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 0.78rem; line-height: 1.6; overflow-x: auto; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.78rem; color: #b91c1c; }
.list { font-size: 0.85rem; padding-left: 20px; }
.list li { margin-bottom: 4px; }
</style>
