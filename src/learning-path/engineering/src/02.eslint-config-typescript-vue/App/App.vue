<script setup>
import { ref, computed } from 'vue'

const configLines = [
  "import js from '@eslint/js'",
  "import vue from 'eslint-plugin-vue'",
  "import ts from '@vue/eslint-config-typescript'",
  "",
  "export default [",
  "  js.configs.recommended,",
  "  ...vue.configs['flat/recommended'],",
  "  ...ts(),",
  "  { rules: {",
  "    'vue/multi-word-component-names': 'error',",
  "    'vue/component-api-style': ['error', ['script-setup']],",
  "    '@typescript-eslint/no-explicit-any': 'warn',",
  "    'no-console': ['warn', { allow: ['warn', 'error'] }],",
  "  } }",
  "]",
]

const rules = [
  { name: 'vue/multi-word-component-names', desc: '组件名强制多词（MyButton 而非 Button）' },
  { name: 'vue/component-api-style', desc: '强制 script-setup 风格' },
  { name: 'vue/no-unused-vars', desc: '未使用变量' },
  { name: 'vue/require-default-prop', desc: '非 required prop 需默认值' },
  { name: '@typescript-eslint/no-explicit-any', desc: '禁用 any（项目内 warn）' },
  { name: '@typescript-eslint/consistent-type-imports', desc: '类型导入用 import type' },
  { name: 'no-console', desc: '限制 console 调用' },
  { name: 'eqeqeq', desc: '强制 === 与 !==' },
]

const enableAny = ref(true)
const filteredRules = computed(() =>
  rules.filter(r => enableAny.value || !r.name.includes('any'))
)
</script>

<template>
  <div class="demo">
    <p class="badge">ESLint flat config · Vue + TS</p>

    <h4>eslint.config.js</h4>
    <pre class="config"><code v-for="(l, i) in configLines" :key="i">{{ l }}</code></pre>

    <h4>关键 rules</h4>
    <label class="toggle">
      <input type="checkbox" v-model="enableAny" /> 启用 no-explicit-any
    </label>
    <ul class="rules">
      <li v-for="r in filteredRules" :key="r.name">
        <code>{{ r.name }}</code>
        <span class="desc">{{ r.desc }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 520px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
h4 { font-size: 0.85rem; margin: 10px 0 4px; color: #444; }
.config { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 8px; font-family: ui-monospace, monospace; font-size: 0.74rem; line-height: 1.4; overflow-x: auto; }
.config code { display: block; white-space: pre; }
.toggle { display: flex; gap: 6px; align-items: center; font-size: 0.78rem; margin: 8px 0; }
.rules { list-style: none; padding: 0; margin: 0; }
.rules li { padding: 4px 8px; font-size: 0.78rem; border-bottom: 1px solid #f0f0f0; display: flex; gap: 8px; }
.rules code { background: #f6f8fa; padding: 1px 6px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.85em; min-width: 280px; }
.desc { color: #666; }
</style>
