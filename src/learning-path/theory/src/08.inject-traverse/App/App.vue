<script setup lang="ts">
import { ref, computed } from 'vue'

/* ============================================================
 * 极简 provide / inject：原型链查找 + shadowing 演示
 * 仿 packages/runtime-core/src/apiInject.ts
 * ============================================================ */

interface Instance {
  name: string
  parent: Instance | null
  // 这里每次 provide 都会创建新对象；通过原型链继承父级
  provides: Record<string, any>
  consumes: Record<string, any>
}

let __current: Instance | null = null

function makeInstance(name: string, parent: Instance | null): Instance {
  const inst: Instance = {
    name,
    parent,
    // 关键：Object.create(parent?.provides ?? null) 形成原型链
    provides: parent ? Object.create(parent.provides) : Object.create(null),
    consumes: {}
  }
  return inst
}

function provide(key: string, value: any) {
  if (!__current) return
  __current.provides[key] = value
}

function inject(key: string): any {
  if (!__current || !__current.parent) return undefined
  // 沿原型链查找：直接读 __current.parent.provides[key]，JS 会沿 __proto__ 一路找
  const provides = __current.parent.provides
  if (key in provides) return provides[key]
  // 没找到，返回 undefined
  return undefined
}

function setCurrent(i: Instance | null) {
  const prev = __current; __current = i
  return () => { __current = prev }
}

/* ============================================================
 * 演示
 * ============================================================ */

const trace = ref<string[]>([])
let n = 0
const log = (s: string) => trace.value.unshift(`#${++n} ${s}`)

// 构造：Root -> A -> B -> C -> D
const Root = makeInstance('Root', null)
const A = makeInstance('A', Root)
const B = makeInstance('B', A)
const C = makeInstance('C', B)
const D = makeInstance('D', C)

// Root provides: theme
setCurrent(Root)(); provide('theme', 'light')
log('Root: provide theme = "light"')

// A provides: theme (shadowing)
setCurrent(A)(); provide('theme', 'dark')
log('A: provide theme = "dark"（shadowing Root）')

// B provides: locale
setCurrent(B)(); provide('locale', 'zh-CN')
log('B: provide locale = "zh-CN"')

// C provides: api
setCurrent(C)(); provide('api', { base: '/v1' })
log('C: provide api = { base: "/v1" }')

// 从 D 注入
setCurrent(D)(); const r1 = inject('theme'); log(`D 注入 theme -> ${r1}（应看到 dark，A 遮蔽 Root）`)
const r2 = inject('locale'); log(`D 注入 locale -> ${r2}`)
const r3 = inject('api'); log(`D 注入 api -> ${JSON.stringify(r3)}`)
const r4 = inject('missing'); log(`D 注入 missing -> ${r4}（undefined）`)

// B 中注入
setCurrent(B)(); const r5 = inject('theme'); log(`B 注入 theme -> ${r5}（应看到 light）`)
const r6 = inject('locale'); log(`B 注入 locale -> ${r6}（应看到 zh-CN，自己 provide 的）`)

const dump = computed(() => {
  const lines: string[] = []
  function walk(i: Instance, depth: number) {
    const keys = Object.keys(i.provides)
    lines.push(`${'  '.repeat(depth)}${i.name} provides: ${keys.length ? keys.join(', ') : '(继承父级)'}`)
    for (const c of [A, B, C, D]) {
      if (c.parent === i) walk(c, depth + 1)
    }
  }
  walk(Root, 0)
  return lines.join('\n')
})
</script>

<template>
  <div class="provide-demo">
    <h3>08 · provide / inject 原型链</h3>

    <div class="grid">
      <section>
        <h4>provides 树</h4>
        <pre>{{ dump }}</pre>
        <p class="hint">每层 provides 通过 Object.create(parent) 形成原型链。</p>
      </section>

      <section>
        <h4>inject trace</h4>
        <ul class="log">
          <li v-for="(l, i) in trace" :key="i">{{ l }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.provide-demo { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 1rem; }
section { background: #fafafa; padding: .75rem; border-radius: 6px; min-height: 280px; }
section h4 { margin: 0 0 .5rem; font-size: .9rem; }
pre { font-size: .78rem; white-space: pre-wrap; word-break: break-all; background: #fff; padding: .5rem; border: 1px solid #ddd; border-radius: 4px; }
.log { max-height: 280px; overflow: auto; font-size: .78rem; padding-left: 1rem; }
.hint { font-size: .75rem; color: #888; }
</style>
