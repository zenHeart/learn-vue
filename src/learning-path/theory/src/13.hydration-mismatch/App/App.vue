<script setup lang="ts">
import { ref, computed } from 'vue'

/* ============================================================
 * 极简 hydration mismatch 模拟
 * 仿 packages/runtime-core/src/hydration.ts
 * ============================================================ */

interface VNode {
  type: string
  text?: string
  attrs?: Record<string, string>
  children?: VNode[]
}

interface WarnEntry {
  type: 'TEXT_MISMATCH' | 'ATTR_MISMATCH' | 'STRUCT_MISMATCH' | 'OK'
  message: string
}

const warns = ref<WarnEntry[]>([])

function compare(actual: VNode | null, expected: VNode | null, path = '$'): WarnEntry[] {
  const out: WarnEntry[] = []
  if (!actual && !expected) return out
  if (!actual || !expected) {
    out.push({ type: 'STRUCT_MISMATCH', message: `${path}: 结构不一致 (${actual ? 'extra' : 'missing'})` })
    return out
  }
  if (actual.type !== expected.type) {
    out.push({ type: 'STRUCT_MISMATCH', message: `${path}: 标签不一致 ${actual.type} != ${expected.type} → 整段回退到 client mount` })
    return out
  }
  if (actual.type === '#text') {
    if (actual.text !== expected.text) {
      out.push({ type: 'TEXT_MISMATCH', message: `${path}: 文本不一致 "${actual.text}" vs "${expected.text}" → 替换文本节点` })
    } else {
      out.push({ type: 'OK', message: `${path}: 文本一致` })
    }
    return out
  }
  // 属性对比
  const allKeys = new Set([...Object.keys(actual.attrs || {}), ...Object.keys(expected.attrs || {})])
  for (const k of allKeys) {
    if ((actual.attrs || {})[k] !== (expected.attrs || {})[k]) {
      out.push({ type: 'ATTR_MISMATCH', message: `${path}: 属性 ${k} 不一致 "${actual.attrs?.[k]}" vs "${expected.attrs?.[k]}" → 替换属性` })
    }
  }
  // children 递归
  const ac = actual.children || []
  const ec = expected.children || []
  for (let i = 0; i < Math.max(ac.length, ec.length); i++) {
    out.push(...compare(ac[i] || null, ec[i] || null, `${path}.children[${i}]`))
  }
  return out
}

const warnings = computed(() => warns.value.filter(w => w.type !== 'OK'))

function color(type: WarnEntry['type']) {
  return { TEXT_MISMATCH: '#1976d2', ATTR_MISMATCH: '#f57c00', STRUCT_MISMATCH: '#d32f2f', OK: '#388e3c' }[type]
}

/* ============================================================
 * 演示场景
 * ============================================================ */

const scenarios = [
  {
    name: 'A · 完全一致（happy path）',
    ssr: { type: 'div', attrs: { id: 'app' }, children: [{ type: 'p', text: 'hello' }] } as VNode,
    client: { type: 'div', attrs: { id: 'app' }, children: [{ type: 'p', text: 'hello' }] } as VNode
  },
  {
    name: 'B · 文本不一致',
    ssr: { type: 'div', attrs: {}, children: [{ type: '#text', text: 'Hello SSR' }] } as VNode,
    client: { type: 'div', attrs: {}, children: [{ type: '#text', text: 'Hello CSR' }] } as VNode
  },
  {
    name: 'C · 属性不一致',
    ssr: { type: 'button', attrs: { class: 'btn', disabled: 'true' }, children: [] } as VNode,
    client: { type: 'button', attrs: { class: 'btn btn-primary', disabled: 'false' }, children: [] } as VNode
  },
  {
    name: 'D · 结构不一致（CSR 多了节点）',
    ssr: { type: 'ul', attrs: {}, children: [{ type: 'li', text: 'a' }] } as VNode,
    client: { type: 'ul', attrs: {}, children: [{ type: 'li', text: 'a' }, { type: 'li', text: 'b' }] } as VNode
  },
  {
    name: 'E · 标签不一致（div vs section）',
    ssr: { type: 'div', attrs: {}, children: [] } as VNode,
    client: { type: 'section', attrs: {}, children: [] } as VNode
  }
]

const idx = ref(0)
const result = computed(() => compare(scenarios[idx.value].ssr, scenarios[idx.value].client))

// 模拟 app.config.warnHandler 收集
const collectedWarns = ref<string[]>([])
function collectWarns() {
  warns.value = result.value
  collectedWarns.value = warnings.value.map(w => `[${w.type}] ${w.message}`)
}
</script>

<template>
  <div class="hm-demo">
    <h3>13 · SSR Hydration Mismatch</h3>

    <div class="row">
      <span v-for="(s, i) in scenarios" :key="i"
            :class="['pill', { active: idx === i }]" @click="idx = i; collectWarns()">{{ s.name }}</span>
    </div>

    <div class="grid">
      <section>
        <h4>SSR HTML (VNode 视角)</h4>
        <pre>{{ JSON.stringify(scenarios[idx].ssr, null, 2) }}</pre>
      </section>

      <section>
        <h4>Client VNode (render 输出)</h4>
        <pre>{{ JSON.stringify(scenarios[idx].client, null, 2) }}</pre>
      </section>

      <section class="full">
        <h4>hydration 差异（warn）</h4>
        <ul class="log">
          <li v-for="(w, i) in result" :key="i" :style="{ color: color(w.type) }">
            <span class="kind">{{ w.type }}</span> — {{ w.message }}
          </li>
        </ul>
        <p class="hint">恢复策略：① 文本/属性差异直接替换节点；② 结构/标签差异 → 整段回退到 client mount。</p>
      </section>

      <section class="full">
        <h4>warnHandler 收集（只保留 warn）</h4>
        <ul class="log">
          <li v-for="(w, i) in collectedWarns" :key="i">[warn] {{ w }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hm-demo { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.row { display: flex; gap: .4rem; flex-wrap: wrap; margin-bottom: 1rem; }
.pill { padding: .3rem .7rem; border: 1px solid #aaa; border-radius: 999px; cursor: pointer; font-size: .8rem; }
.pill.active { background: #333; color: #fff; border-color: #333; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.grid section.full { grid-column: 1 / -1; }
section { background: #fafafa; padding: .75rem; border-radius: 6px; min-height: 200px; }
section h4 { margin: 0 0 .5rem; font-size: .9rem; }
pre { font-size: .75rem; white-space: pre-wrap; word-break: break-all; background: #fff; padding: .5rem; border: 1px solid #ddd; border-radius: 4px; }
.log { max-height: 240px; overflow: auto; font-size: .78rem; padding-left: 1rem; }
.kind { display: inline-block; min-width: 130px; font-weight: bold; }
.hint { font-size: .75rem; color: #888; margin-top: .5rem; }
</style>
