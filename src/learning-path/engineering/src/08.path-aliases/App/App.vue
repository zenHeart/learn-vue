<script setup>
import { ref, computed } from 'vue'

const crossPkg = ref(false)

const aliases = computed(() => [
  { alias: '@', target: 'src/*', type: '包内' },
  { alias: '@components', target: 'src/components/*', type: '包内' },
  { alias: '@composables', target: 'src/composables/*', type: '包内' },
  { alias: '@stores', target: 'src/stores/*', type: '包内' },
  ...(crossPkg.value ? [
    { alias: '@my-org/ui', target: 'packages/ui/src/index.ts', type: '跨包' },
    { alias: '@my-org/hooks', target: 'packages/hooks/src/index.ts', type: '跨包' },
  ] : []),
])

const sampleImport = computed(() => {
  return crossPkg.value
    ? `import { UiButton } from '@my-org/ui'\nimport { useDebounce } from '@my-org/hooks'\nimport Counter from '@/components/Counter.vue'`
    : `import Counter from '@/components/Counter.vue'\nimport { useDebounce } from '@/composables/useDebounce'`
})
</script>

<template>
  <div class="demo">
    <p class="badge">路径别名 · tsconfig + Vite 一致</p>

    <label class="toggle">
      <input type="checkbox" v-model="crossPkg" /> 启用跨包别名
    </label>

    <h4>别名映射</h4>
    <table>
      <thead><tr><th>别名</th><th>目标</th><th>类型</th></tr></thead>
      <tbody>
        <tr v-for="a in aliases" :key="a.alias">
          <td><code>{{ a.alias }}</code></td>
          <td><code>{{ a.target }}</code></td>
          <td :class="a.type">{{ a.type }}</td>
        </tr>
      </tbody>
    </table>

    <h4>import 示例</h4>
    <pre class="sample"><code>{{ sampleImport }}</code></pre>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 520px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.toggle { display: flex; gap: 6px; align-items: center; font-size: 0.78rem; margin-bottom: 8px; }
h4 { font-size: 0.85rem; margin: 8px 0 4px; color: #444; }
table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
th, td { padding: 5px 10px; border-bottom: 1px solid #f0f0f0; text-align: left; }
td.包内 { color: #2c8e63; }
td.跨包 { color: #0066cc; font-weight: 600; }
code { background: #f6f8fa; padding: 1px 6px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.9em; }
.sample { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 8px; font-family: ui-monospace, monospace; font-size: 0.78rem; }
.sample code { background: transparent; padding: 0; color: inherit; white-space: pre; }
</style>
