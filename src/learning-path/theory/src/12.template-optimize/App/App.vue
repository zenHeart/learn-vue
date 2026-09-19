<script setup lang="ts">
import { ref, computed } from 'vue'

/* ============================================================
 * 编译期优化模拟：hoistStatic + PatchFlag + Block Tree
 * 仿 packages/compiler-core/src/transforms/hoistStatic.ts 等
 * ============================================================ */

const enum PatchFlags {
  TEXT = 1,
  CLASS = 2,
  STYLE = 4,
  PROPS = 8,
  FULL_PROPS = 16,
  NEED_HYDRATION = 128
}

const flagName: Record<number, string> = {
  [PatchFlags.TEXT]: 'TEXT',
  [PatchFlags.CLASS]: 'CLASS',
  [PatchFlags.STYLE]: 'STYLE',
  [PatchFlags.PROPS]: 'PROPS',
  [PatchFlags.FULL_PROPS]: 'FULL_PROPS',
  [PatchFlags.NEED_HYDRATION]: 'NEED_HYDRATION'
}

function decode(flag: number): string[] {
  const out: string[] = []
  for (const k of Object.keys(flagName)) {
    const n = Number(k)
    if (flag & n) out.push(flagName[n])
  }
  return out.length ? out : ['STATIC(0)']
}

interface AstNode {
  type: 'element' | 'text' | 'interp'
  tag?: string
  attrs?: Record<string, string>
  children?: AstNode[]
  expr?: string
  patchFlag?: number
  dynamicProps?: string[]
  hoisted?: boolean
  isBlock?: boolean
  hoistName?: string
}

let hoistCount = 0

function inferFlag(attrs: Record<string, string>): { flag: number; dynamic: string[] } {
  let flag = 0
  const dynamic: string[] = []
  for (const k of Object.keys(attrs)) {
    if (k === ':class') { flag |= PatchFlags.CLASS; dynamic.push('class') }
    else if (k === ':style') { flag |= PatchFlags.STYLE; dynamic.push('style') }
    else if (k.startsWith(':') || k.startsWith('@')) { flag |= PatchFlags.PROPS; dynamic.push(k.replace(/^:/, '')) }
  }
  return { flag, dynamic: dynamic.length ? dynamic : [] }
}

function isStaticElement(node: AstNode): boolean {
  if (node.type !== 'element') return false
  for (const k of Object.keys(node.attrs || {})) if (k.startsWith(':') || k.startsWith('@')) return false
  return (node.children ?? []).every(isStaticChild)
}
function isStaticChild(n: AstNode): boolean {
  if (n.type === 'text') return /^[\sa-zA-Z0-9.,!?]*$/.test(n.expr || '')
  if (n.type === 'interp') return false
  return isStaticElement(n)
}

// 模拟编译 + 优化
function compile(template: string) {
  // 1) parse（最简版：直接 AST 构造）
  const ast: AstNode = {
    type: 'element', tag: 'div',
    attrs: { class: 'container', id: 'app' },
    children: [
      { type: 'element', tag: 'h1', attrs: {}, children: [{ type: 'text', expr: 'Static Title' }] },
      { type: 'element', tag: 'p', attrs: { class: 'greet' }, children: [{ type: 'text', expr: 'Hello' }] },
      { type: 'element', tag: 'div', attrs: { class: 'box', '@click': 'onBox' }, children: [
        { type: 'element', tag: 'span', attrs: {}, children: [{ type: 'interp', expr: 'count' }] },
        { type: 'text', expr: ' - ' },
        { type: 'interp', expr: 'msg' }
      ] }
    ]
  }

  // 2) transform: hoist + patchFlag
  function transform(n: AstNode) {
    if (n.type === 'element') {
      const { flag, dynamic } = inferFlag(n.attrs!)
      n.patchFlag = flag
      n.dynamicProps = dynamic
      // hoistStatic
      if (isStaticElement(n)) {
        n.hoisted = true
        n.hoistName = `hoisted_${++hoistCount}`
      } else {
        n.hoisted = false
      }
      // Block Tree: 含 dynamic children 的节点 = block
      if ((n.patchFlag ?? 0) > 0 || (n.children ?? []).some(c => c.type === 'interp')) {
        n.isBlock = true
      }
      n.children = n.children?.map(transform)
    }
    return n
  }

  return transform(ast)
}

const template = ref(`<div class="container" id="app">
  <h1>Static Title</h1>
  <p class="greet">Hello</p>
  <div class="box" @click="onBox">
    <span>{{ count }}</span> - {{ msg }}
  </div>
</div>`)

const ast = computed(() => compile(template.value))

// 模拟生成的 render function
const renderCode = computed(() => {
  let code = ''
  // hoisted
  const hoisted: string[] = []
  function walk(n: AstNode, depth: number) {
    const ind = '  '.repeat(depth)
    if (n.hoisted) {
      hoisted.push(`${ind}const ${n.hoistName} = /* hoisted */ createElementVNode("${n.tag}", ${JSON.stringify(n.attrs)})`)
      return
    }
    if (n.type === 'text') { code += `${ind}'${n.expr}',\n`; return }
    if (n.type === 'interp') { code += `${ind}toDisplayString(_ctx.${n.expr}),\n`; return }
    const open = n.isBlock ? '_createElementBlock' : '_createElementVNode'
    const flag = n.patchFlag ?? 0
    const props = Object.entries(n.attrs || {}).map(([k, v]) => `${k.startsWith(':') ? k.slice(1) : k}: ${k.startsWith(':') ? `_ctx.${v}` : `"${v}"`}`).join(', ')
    code += `${ind}${open}("${n.tag}", { ${props} },\n`
    for (const c of n.children ?? []) walk(c, depth + 1)
    code += `${ind}${flag ? ', ' + flag + ` /* ${decode(flag).join('|')} */` : ''})\n`
  }
  walk(ast.value, 1)
  return `// === hoisted constants ===\n${hoisted.join('\n')}\n\n// === render function ===\nfunction render(_ctx, _cache) {\n  return ${code.trim().split('\n')[0]}\n${code.trim().split('\n').slice(1).join('\n')}\n}`
})
</script>

<template>
  <div class="opt-demo">
    <h3>12 · 编译期优化</h3>

    <div class="row">
      <label>template:</label>
      <textarea v-model="template" rows="6"></textarea>
    </div>

    <div class="grid">
      <section>
        <h4>优化后的 AST</h4>
        <pre>{{ JSON.stringify(ast, null, 2) }}</pre>
      </section>

      <section class="full">
        <h4>生成的 render function</h4>
        <pre>{{ renderCode }}</pre>
      </section>

      <section>
        <h4>PatchFlag 字典</h4>
        <ul>
          <li v-for="(name, k) in flagName" :key="k">
            {{ name }} = {{ k }} (<code>{{ Number(k).toString(2).padStart(8, '0') }}</code>)
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.opt-demo { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.row { margin-bottom: 1rem; display: flex; gap: .5rem; align-items: flex-start; }
textarea { width: 100%; font-family: inherit; font-size: .78rem; padding: .5rem; }
.grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
.grid section.full { grid-column: 1 / -1; }
section { background: #fafafa; padding: .75rem; border-radius: 6px; }
section h4 { margin: 0 0 .5rem; font-size: .9rem; }
pre { font-size: .75rem; white-space: pre-wrap; word-break: break-all; background: #fff; padding: .5rem; border: 1px solid #ddd; border-radius: 4px; }
ul { font-size: .8rem; }
code { background: #eee; padding: 0 .25rem; border-radius: 3px; }
</style>
