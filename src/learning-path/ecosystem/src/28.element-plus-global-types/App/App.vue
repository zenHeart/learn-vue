<template>
  <div class="demo">
    <h3>GlobalComponents + unplugin-vue-components 类型增强</h3>
    <p class="hint">
      模拟一个「已注册 Element Plus 全部组件 + 项目本地 UI 组件」的场景，展示
      <code>GlobalComponents</code> 声明合并的产物长什么样。
    </p>

    <section class="card">
      <h4>① 模拟 components.d.ts 的运行时检查</h4>
      <p>运行时 <code>globalThis.__COMPONENTS_DTS__</code> =
        <strong>{{ dtsMarker }}</strong>
      </p>
      <p class="hint">
        真实项目中 unplugin-vue-components 会写 <code>src/types/components.d.ts</code>，
        模板里的 <code>&lt;ElButton&gt;</code> 自动获得类型提示。
      </p>
    </section>

    <section class="card">
      <h4>② 模拟按需引入的注册器（resolver）</h4>
      <p>当前已注册的本地组件：</p>
      <ul class="chips">
        <li v-for="c in registry" :key="c.name">
          <code>&lt;{{ c.name }}&gt;</code>
          <span class="src">→ {{ c.from }}</span>
        </li>
      </ul>
      <button @click="addMockComponent">模拟新增一个组件</button>
    </section>

    <section class="card">
      <h4>③ 类型扩展模板（声明合并）</h4>
      <pre>{{ dtsSnippet }}</pre>
    </section>

    <section class="card">
      <h4>④ shadcn-vue 风格的本地组件注册</h4>
      <pre>{{ shadcnSnippet }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface RegistryEntry { name: string; from: string }
const registry = ref<RegistryEntry[]>([
  { name: 'ElButton', from: 'element-plus/es/components/button' },
  { name: 'ElInput', from: 'element-plus/es/components/input' },
  { name: 'ElTable', from: 'element-plus/es/components/table' },
  { name: 'NButton', from: 'naive-ui' },
])

function addMockComponent() {
  const i = registry.value.length
  registry.value.push({
    name: `LocalComp${i}`,
    from: `@/components/LocalComp${i}.vue`,
  })
}

const dtsMarker = (globalThis as any).__COMPONENTS_DTS__ ?? '未生成（REPL 环境无 Vite 插件）'

const dtsSnippet = `// src/types/components.d.ts
declare module 'vue' {
  interface GlobalComponents {
    ElButton: typeof import('element-plus/es')['ElButton']
    ElInput: typeof import('element-plus/es')['ElInput']
    NButton: typeof import('naive-ui')['NButton']
  }
}

export {}   // 标记为模块`

const shadcnSnippet = `// src/types/shadcn-components.d.ts
import type Button from '@/components/ui/button.vue'
import type Card from '@/components/ui/card.vue'

declare module 'vue' {
  interface GlobalComponents {
    Button: typeof Button
    Card: typeof Card
  }
}

export {}`
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
.chips {
  list-style: none;
  padding: 0;
  margin: 0 0 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chips li {
  padding: 4px 10px;
  background: #ecfeff;
  border: 1px solid #67e8f9;
  border-radius: 12px;
  font-size: 12px;
}
.chips .src { color: #64748b; font-size: 11px; margin-left: 6px; }
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
</style>