<template>
  <div class="demo">
    <h3>Vue 3 编译时 flag 演示</h3>
    <p class="hint">
      这四个 flag 由打包工具（Vite/Webpack）在编译期注入。这里通过 <code>globalThis</code>
      反查它们的实际值；REPL 默认从 unpkg 加载 vue@3，flag 取默认值。
    </p>

    <section class="card">
      <h4>① 当前构建的 flag 值</h4>
      <table class="flag-table">
        <thead>
          <tr><th>flag</th><th>实际值</th><th>默认</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key">
            <td><code>{{ row.key }}</code></td>
            <td>
              <span :class="['badge', row.bool ? 'on' : 'off']">
                {{ row.value }}
              </span>
            </td>
            <td>{{ row.default }}</td>
            <td>{{ row.desc }}</td>
          </tr>
        </tbody>
      </table>
      <button @click="refresh">重新读取</button>
    </section>

    <section class="card">
      <h4>② Options API 是否可用</h4>
      <p>
        当 <code>__VUE_OPTIONS_API__ = false</code>，以下 Options API 写法在运行时静默无效：
      </p>
      <pre>// 写法上正确，运行时不生效
defineComponent({
  data() { return { n: 0 } },
  methods: { inc() { this.n++ } },
})</pre>
      <p class="hint">
        本 demo 当前 <strong>{{ apiEnabled ? '允许' : '不允许' }}</strong> Options API。
        真实项目中应配合 ESLint 规则 <code>vue/no-options-api</code> 在编译期拦截。
      </p>
    </section>

    <section class="card">
      <h4>③ 通过 <code>hasInjectionContext</code> 等内部 API 验证构建产物</h4>
      <p>
        <code>typeof hasInjectionContext === 'function'</code>：
        <strong>{{ typeof hasInjectionContext }}</strong>
      </p>
      <p class="hint">
        内部 API 函数本体一定存在；flag 控制的是分支条件（编译期被消除）。
      </p>
    </section>

    <section class="card">
      <h4>④ Vite 配置建议</h4>
      <pre>{{ viteConfigSnippet }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { hasInjectionContext } from 'vue'

const apiEnabled = ref(true)
const rows = ref<Array<{
  key: string
  value: string
  bool: boolean
  default: string
  desc: string
}>>([])

function readFlags() {
  const w = globalThis as any
  return [
    {
      key: '__VUE_OPTIONS_API__',
      get value() { return String(w.__VUE_OPTIONS_API__ ?? 'true') },
      get bool() { return (w.__VUE_OPTIONS_API__ ?? true) === true },
      default: 'true',
      desc: '关闭后 Options API 代码被 tree-shake',
    },
    {
      key: '__VUE_PROD_DEVTOOLS__',
      get value() { return String(w.__VUE_PROD_DEVTOOLS__ ?? 'false') },
      get bool() { return w.__VUE_PROD_DEVTOOLS__ === true },
      default: 'false',
      desc: '生产构建是否暴露 devtools 钩子',
    },
    {
      key: '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__',
      get value() { return String(w.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ ?? 'false') },
      get bool() { return w.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ === true },
      default: 'false',
      desc: 'SSR 不匹配时打印详细 diff',
    },
    {
      key: '__VUE_REACTIVITY__',
      get value() { return String(w.__VUE_REACTIVITY__ ?? 'true') },
      get bool() { return w.__VUE_REACTIVITY__ !== false },
      default: 'true',
      desc: '数组 Proxy 代理开关（关闭后走优化路径）',
    },
  ]
}

function refresh() {
  rows.value = readFlags()
  apiEnabled.value = (globalThis as any).__VUE_OPTIONS_API__ !== false
  console.log('[compile-flags]', rows.value.map(r => `${r.key}=${r.value}`).join(' '))
}

const viteConfigSnippet = `// vite.config.ts
export default defineConfig({
  plugins: [vue()],
  define: {
    // 字符串值！避免与相邻 token 黏合
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
})`

onMounted(refresh)
</script>

<style scoped>
.demo {
  max-width: 820px;
  margin: 16px auto;
  padding: 16px;
  color: #213547;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.card {
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e293b;
}
.hint {
  font-size: 12px;
  color: #64748b;
  margin: 6px 0;
}
code {
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.82rem;
}
pre {
  margin: 6px 0;
  padding: 8px 10px;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  white-space: pre-wrap;
}
.flag-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-bottom: 8px;
}
.flag-table th, .flag-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: middle;
}
.flag-table th {
  color: #64748b;
  font-weight: 500;
  font-size: 12px;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-family: ui-monospace, monospace;
}
.badge.on { background: #dcfce7; color: #166534; }
.badge.off { background: #fee2e2; color: #991b1b; }
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
</style>