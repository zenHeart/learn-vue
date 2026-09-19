<script setup>
import { ref, computed } from 'vue'

const formatOnSave = ref(true)
const takeoverMode = ref(false)

const groups = computed(() => [
  {
    title: 'Vue / Volar',
    items: [
      { key: 'vue.server.hybridMode', value: 'true' },
      { key: 'files.associations: *.vue', value: 'vue' },
      { key: takeoverMode.value ? 'typescript.tsserver.useVscodeVolar' : '(未启用 takeover)', value: takeoverMode.value ? 'true' : '' },
    ],
  },
  {
    title: 'Format & Lint',
    items: [
      { key: 'editor.formatOnSave', value: String(formatOnSave.value) },
      { key: 'editor.defaultFormatter', value: 'esbenp.prettier-vscode' },
      { key: 'eslint.validate', value: '["javascript","typescript","vue"]' },
      { key: 'stylelint.validate', value: '["css","scss","vue"]' },
    ],
  },
  {
    title: 'Code Actions on Save',
    items: [
      { key: 'source.fixAll.eslint', value: 'explicit' },
      { key: 'source.fixAll.stylelint', value: 'explicit' },
    ],
  },
])
</script>

<template>
  <div class="demo">
    <p class="badge">VSCode 推荐配置</p>

    <div class="controls">
      <label><input type="checkbox" v-model="formatOnSave" /> formatOnSave</label>
      <label><input type="checkbox" v-model="takeoverMode" /> Volar takeover</label>
    </div>

    <div v-for="g in groups" :key="g.title" class="group">
      <h4>{{ g.title }}</h4>
      <ul>
        <li v-for="it in g.items" :key="it.key">
          <code>{{ it.key }}</code>
          <span class="sep">:</span>
          <span class="val">{{ it.value }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 540px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.controls { display: flex; gap: 12px; margin-bottom: 10px; font-size: 0.78rem; flex-wrap: wrap; }
.controls label { display: flex; gap: 4px; align-items: center; }
.group { margin-bottom: 10px; }
h4 { font-size: 0.82rem; margin: 8px 0 4px; color: #444; }
ul { list-style: none; padding: 0; margin: 0; background: #f6f8fa; border-radius: 8px; }
li { display: grid; grid-template-columns: 1fr auto 1fr; gap: 6px; padding: 4px 10px; font-size: 0.74rem; border-bottom: 1px solid #eaecef; }
li code { background: #fff; padding: 1px 6px; border-radius: 4px; font-family: ui-monospace, monospace; }
.sep { color: #888; }
.val { font-family: ui-monospace, monospace; color: #2c8e63; }
</style>
