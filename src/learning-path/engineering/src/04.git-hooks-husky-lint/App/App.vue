<script setup>
import { ref, computed } from 'vue'

const hooks = [
  { name: 'pre-commit', trigger: '提交前', action: 'lint-staged', tools: ['eslint --fix', 'prettier --write'] },
  { name: 'commit-msg', trigger: '提交时', action: 'commitlint', tools: ['@commitlint/config-conventional'] },
  { name: 'pre-push', trigger: '推送前', action: 'vitest run --changed', tools: ['vitest'] },
  { name: 'post-merge', trigger: '合并后', action: 'pnpm install', tools: ['pnpm'] },
]

const skipStaged = ref(false)
const sampleCommit = ref('feat: 添加用户列表')

const commitValid = computed(() => /^(feat|fix|refactor|docs|test|chore|perf)(\([^)]+\))?!?: .{1,72}$/.test(sampleCommit.value))

const flow = computed(() => {
  if (skipStaged.value) {
    return ['git commit -m "..."', '(跳过 lint-staged)', 'git commit 成功', 'commitlint 校验']
  }
  return ['git commit -m "..."', 'pre-commit hook', 'lint-staged (仅 staged 文件)', 'eslint --fix + prettier', 'commit-msg hook', 'commitlint', '提交成功']
})
</script>

<template>
  <div class="demo">
    <p class="badge">Husky + lint-staged</p>

    <h4>Hooks 配置</h4>
    <ul class="hooks">
      <li v-for="h in hooks" :key="h.name">
        <code>{{ h.name }}</code>
        <span class="when">{{ h.trigger }}</span>
        <span class="action">{{ h.action }}</span>
      </li>
    </ul>

    <h4>commitlint 校验</h4>
    <input v-model="sampleCommit" class="commit-input" />
    <div :class="['commit-status', commitValid ? 'ok' : 'fail']">
      {{ commitValid ? '✓ 符合 conventional commit' : '✗ 格式不符' }}
    </div>

    <h4>提交流程</h4>
    <label class="toggle">
      <input type="checkbox" v-model="skipStaged" /> 跳过 lint-staged（不推荐）
    </label>
    <div class="flow">
      <span v-for="(s, i) in flow" :key="i" class="step">
        {{ s }}<span v-if="i < flow.length - 1" class="arrow">→</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 540px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
h4 { font-size: 0.85rem; margin: 10px 0 4px; color: #444; }
.hooks { list-style: none; padding: 0; margin: 0 0 10px; }
.hooks li { display: grid; grid-template-columns: 100px 80px 1fr; gap: 8px; padding: 4px 8px; font-size: 0.78rem; border-bottom: 1px solid #f0f0f0; }
.hooks code { background: #f6f8fa; padding: 1px 6px; border-radius: 4px; font-family: ui-monospace, monospace; }
.when { color: #888; }
.action { font-family: ui-monospace, monospace; color: #2c8e63; }
.commit-input { width: 100%; padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px; font-family: ui-monospace, monospace; font-size: 0.82rem; box-sizing: border-box; }
.commit-status { margin-top: 4px; padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; }
.commit-status.ok { background: #e8f8f0; color: #27ae60; }
.commit-status.fail { background: #fdecea; color: #c0392b; }
.toggle { display: flex; gap: 6px; align-items: center; font-size: 0.78rem; margin: 8px 0; }
.flow { background: #f6f8fa; padding: 10px; border-radius: 8px; font-family: ui-monospace, monospace; font-size: 0.74rem; line-height: 1.6; }
.step { margin-right: 4px; }
.arrow { color: #42b883; margin: 0 4px; font-weight: 700; }
</style>
