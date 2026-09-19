<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 默认：复杂对象走 attribute（错误示范）</h4>
      <div :config="objDefault">属性名: config</div>
      <p class="hint">值被序列化为 [object Object]，类型丢失</p>
      <pre>{{ inspectResult(objDefaultKey, objDefault) }}</pre>
    </section>

    <section class="card">
      <h4>② .prop：强制走 DOM property</h4>
      <div :config.prop="objDefault" ref="propRef">属性名: config</div>
      <p class="hint">.prop 后值变成 DOM property：可保留对象引用</p>
      <pre>{{ propRefInspect }}</pre>
    </section>

    <section class="card">
      <h4>③ .attr：data-* / aria-* 强制 attribute</h4>
      <div :data-id.attr="dataId" :aria-label.attr="ariaLabel" ref="attrRef">
        请用 DevTools 查看 DOM 属性
      </div>
      <pre>{{ attrRefInspect }}</pre>
      <p class="hint">.attr 让 Vue 显式走 setAttribute，保留 kebab-case 形式</p>
    </section>

    <section class="card">
      <h4>④ .camel：把 kebab-case 转 camelCase（SVG 属性）</h4>
      <svg width="120" height="80" :view-box.camel="viewBox">
        <rect x="10" y="10" width="100" height="60" fill="#a78bfa" />
      </svg>
      <p class="hint">view-box.camel 写入 SVGElement.viewBox（camelCase）</p>
      <pre>{{ svgInspect }}</pre>
    </section>

    <section class="card">
      <h4>⑤ 对照：未加 .camel 时 SVG 属性</h4>
      <svg width="120" height="80" :view-box="viewBox">
        <rect x="10" y="10" width="100" height="60" fill="#f87171" />
      </svg>
      <p class="hint">无 .camel 时属性名会被原样写入，可能未生效</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const title = ref('v-bind 修饰符：prop / attr / camel')

const objDefault = { id: 'x-1', nested: { v: 1 } }
const objDefaultKey = 'config'

const dataId = ref('user-42')
const ariaLabel = ref('demo-card')

const viewBox = ref('0 0 120 80')

const propRef = ref<HTMLElement | null>(null)
const propRefInspect = ref('')
onMounted(() => {
  if (propRef.value) {
    const el = propRef.value as any
    propRefInspect.value = `DOM property "config": ${JSON.stringify(el.config)}\nattribute "config": ${el.getAttribute('config')}`
  }
})

const attrRef = ref<HTMLElement | null>(null)
const attrRefInspect = ref('')
onMounted(() => {
  if (attrRef.value) {
    const el = attrRef.value
    attrRefInspect.value = `attribute data-id: ${el.getAttribute('data-id')}\nattribute aria-label: ${el.getAttribute('aria-label')}`
  }
})

const svgInspect = ref('')
onMounted(() => {
  const svg = document.querySelector('svg') as SVGElement | null
  if (svg) {
    svgInspect.value = `viewBox attr: ${svg.getAttribute('viewBox')}\nviewBox prop: ${(svg as any).viewBox}`
  }
})

function inspectResult(key: string, val: any) {
  return `key="${key}" → string 化结果: ${String(val)}\ntypeof: ${typeof val}`
}
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
  margin: 4px 0;
}
pre {
  margin: 6px 0 0;
  padding: 8px;
  background: #0f172a;
  color: #f8fafc;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
}
svg {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  margin-right: 8px;
}
</style>
