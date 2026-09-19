<script setup lang="ts">
import { ref, computed } from 'vue'

/* ============================================================
 * 极简 SFC 编译流水线：parse → transform → generate
 * 仿 packages/compiler-core/src/compile.ts
 * ============================================================ */

// ---------- 1. 极简模板词法分析 ----------
type Token = { type: 'tag-open' | 'tag-close' | 'tag-self-close' | 'text' | 'mustache' | 'attr'; value: string }

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < input.length) {
    if (input[i] === '<') {
      if (input.startsWith('</', i)) {
        const end = input.indexOf('>', i)
        tokens.push({ type: 'tag-close', value: input.slice(i + 2, end).trim() })
        i = end + 1
      } else {
        // 标签开始
        const tagEnd = input.indexOf('>', i)
        const tagInner = input.slice(i + 1, tagEnd)
        const isSelfClose = input[tagEnd - 1] === '/'
        const space = tagInner.search(/\s/)
        const tagName = space === -1 ? tagInner : tagInner.slice(0, space)
        tokens.push({ type: 'tag-open', value: tagName })
        // 属性
        const attrPart = (space === -1 ? '' : tagInner.slice(space + (isSelfClose ? 1 : 0))).trim()
        if (attrPart) {
          // 简易属性匹配：key="value" / :key="value" / @click="..."
          const re = /([:@]?\w+)="([^"]*)"/g
          let m
          while ((m = re.exec(attrPart))) tokens.push({ type: 'attr', value: `${m[1]}=${m[2]}` })
        }
        if (isSelfClose) tokens.push({ type: 'tag-self-close', value: '/' })
        i = tagEnd + 1
      }
    } else if (input.startsWith('{{', i)) {
      const end = input.indexOf('}}', i + 2)
      tokens.push({ type: 'mustache', value: input.slice(i + 2, end).trim() })
      i = end + 2
    } else {
      let j = i
      while (j < input.length && input[j] !== '<' && !input.startsWith('{{', j)) j++
      tokens.push({ type: 'text', value: input.slice(i, j) })
      i = j
    }
  }
  return tokens
}

// ---------- 2. parse：tokens → AST ----------
interface AstNode {
  type: 'element' | 'text' | 'interp'
  tag?: string
  attrs?: Record<string, string>
  children?: AstNode[]
  expr?: string
}

function parse(tokens: Token[]): AstNode {
  let pos = 0
  function walk(): AstNode {
    const t = tokens[pos++]
    if (!t) return { type: 'text', expr: '' }
    if (t.type === 'tag-open') {
      const tag = t.value
      const attrs: Record<string, string> = {}
      while (tokens[pos]?.type === 'attr') {
        const a = tokens[pos++].value
        const [k, v] = a.split('=')
        attrs[k] = v
      }
      if (tokens[pos]?.type === 'tag-self-close') { pos++; return { type: 'element', tag, attrs, children: [] } }
      const children: AstNode[] = []
      while (tokens[pos] && tokens[pos].type !== 'tag-close') children.push(walk())
      pos++ // skip tag-close
      return { type: 'element', tag, attrs, children }
    }
    if (t.type === 'mustache') return { type: 'interp', expr: t.value }
    return { type: 'text', expr: t.value }
  }
  return walk()
}

// ---------- 3. transform：分析 patchFlag、静态提升 ----------
const enum PatchFlags {
  TEXT = 1, CLASS = 2, STYLE = 4, PROPS = 8, NEED_HYDRATION = 128
}

function inferFlag(attrs: Record<string, string>): number {
  let flag = 0
  for (const k of Object.keys(attrs)) {
    if (k === 'class' || k === ':class') flag |= PatchFlags.CLASS
    else if (k === 'style' || k === ':style') flag |= PatchFlags.STYLE
    else if (k.startsWith(':') || k.startsWith('@')) flag |= PatchFlags.PROPS
  }
  return flag
}

function transform(ast: AstNode): AstNode {
  if (ast.type === 'element') {
    ast.attrs = ast.attrs || {}
    ;(ast as any).patchFlag = inferFlag(ast.attrs)
    ;(ast as any).dynamicProps = Object.keys(ast.attrs).filter(k => k.startsWith(':') || k.startsWith('@')).map(k => k.replace(/^:/, ''))
    ;(ast as any).isStatic = (ast.patchFlag === 0 && (ast.children ?? []).every(c => c.type === 'text' && /^[\sa-zA-Z0-9.,!?]*$/.test(c.expr || '')))
    ast.children = ast.children?.map(transform)
  }
  return ast
}

// ---------- 4. generate：AST → render function ----------
function generate(ast: AstNode, depth = 0): string {
  const ind = '  '.repeat(depth)
  if (ast.type === 'text') return `${ind}'${ast.expr}'`
  if (ast.type === 'interp') return `${ind}_toDisplayString(_ctx.${ast.expr})`
  if (ast.type === 'element') {
    const tag = ast.tag
    const attrs = ast.attrs || {}
    const patchFlag = (ast as any).patchFlag ?? 0
    const isStatic = (ast as any).isStatic
    const propsStr = Object.keys(attrs).map(k => {
      if (k.startsWith(':')) return `${ind}  ${k.slice(1)}: _ctx.${attrs[k]}`
      if (k.startsWith('@')) return `${ind}  on${capitalize(k.slice(1))}: _ctx.${attrs[k]}`
      if (k === 'class') return `${ind}  class: ${attrs[k]}`
      return `${ind}  ${k}: "${attrs[k]}"`
    }).join(',\n')
    const head = isStatic ? `${ind}_hoisted_${tag}` : `${ind}_createElementBlock("${tag}"${propsStr ? ',\n' + propsStr : ''}`
    const children = (ast.children ?? []).map(c => generate(c, depth + 1)).join(',\n')
    const tail = isStatic ? '' : `,\n${ind}  [${children}],\n${ind}  ${patchFlag} /* patchFlag */\n${ind})`
    return head + tail
  }
  return ''
}
function capitalize(s: string) { return s[0].toUpperCase() + s.slice(1) }

/* ============================================================
 * 演示
 * ============================================================ */

const samples = [
  {
    name: 'A · 静态 + 动态文本',
    template: `<div class="box"><p>{{ msg }}</p></div>`
  },
  {
    name: 'B · 动态 class + 事件',
    template: `<button :class="cls" @click="onClick">click me</button>`
  },
  {
    name: 'C · 嵌套静态 + 动态',
    template: `<div><h1>Title</h1><p :id="id">{{ text }}</p></div>`
  }
]

const idx = ref(0)
const tokens = computed(() => tokenize(samples[idx.value].template))
const ast = computed(() => transform(parse(tokens.value)))
const renderCode = computed(() => generate(ast.value))
</script>

<template>
  <div class="sfc-demo">
    <h3>11 · SFC 编译流水线</h3>

    <div class="row">
      <span v-for="(s, i) in samples" :key="i"
            :class="['pill', { active: idx === i }]" @click="idx = i">{{ s.name }}</span>
    </div>

    <div class="grid">
      <section>
        <h4>① template 源</h4>
        <pre>{{ samples[idx].template }}</pre>
      </section>

      <section>
        <h4>② tokens</h4>
        <ul class="log">
          <li v-for="(t, i) in tokens" :key="i">
            <code>{{ t.type }}</code>: {{ t.value }}
          </li>
        </ul>
      </section>

      <section>
        <h4>③ AST</h4>
        <pre>{{ JSON.stringify(ast, null, 2) }}</pre>
      </section>

      <section class="full">
        <h4>④ render function（codegen）</h4>
        <pre>function render(_ctx, _cache) {
{{ renderCode }}
}</pre>
      </section>
    </div>
  </div>
</template>

<style scoped>
.sfc-demo { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.row { display: flex; gap: .4rem; flex-wrap: wrap; margin-bottom: 1rem; }
.pill { padding: .3rem .7rem; border: 1px solid #aaa; border-radius: 999px; cursor: pointer; font-size: .8rem; }
.pill.active { background: #333; color: #fff; border-color: #333; }
.grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.grid section.full { grid-column: 1 / -1; }
section { background: #fafafa; padding: .75rem; border-radius: 6px; min-height: 200px; }
section h4 { margin: 0 0 .5rem; font-size: .9rem; }
pre { font-size: .75rem; white-space: pre-wrap; word-break: break-all; background: #fff; padding: .5rem; border: 1px solid #ddd; border-radius: 4px; }
.log { max-height: 200px; overflow: auto; font-size: .75rem; padding-left: 1rem; }
code { background: #eee; padding: 0 .25rem; border-radius: 3px; }
</style>
