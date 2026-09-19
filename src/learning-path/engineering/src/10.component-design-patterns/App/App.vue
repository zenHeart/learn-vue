<script setup>
import { ref, computed } from 'vue'

const patterns = [
  { id: 'presentational', name: 'Presentational', desc: '纯展示，接 props，emit 事件', complexity: 1 },
  { id: 'container', name: 'Container', desc: '拿数据，包装展示组件', complexity: 2 },
  { id: 'compound', name: 'Compound', desc: '父 provide，子 inject 共享状态', complexity: 3 },
  { id: 'headless', name: 'Headless', desc: '无样式，逻辑完全可复用', complexity: 3 },
  { id: 'polymorphic', name: 'Polymorphic', desc: 'as prop 决定根节点类型', complexity: 4 },
  { id: 'slot', name: 'Slot Composition', desc: '任意片段可被 slot 替换', complexity: 3 },
  { id: 'render-prop', name: 'Render Props', desc: '把渲染权交给消费者', complexity: 3 },
]

const scenarios = [
  { id: 'simple', label: '简单展示按钮', recommended: 'presentational' },
  { id: 'list', label: '列表 + 分页 + 搜索', recommended: 'container' },
  { id: 'menu', label: '菜单（多项组合）', recommended: 'compound' },
  { id: 'dropdown', label: '下拉菜单（无样式）', recommended: 'headless' },
  { id: 'link', label: '可作为 button 或 a', recommended: 'polymorphic' },
  { id: 'card', label: '卡片任意位置自定义', recommended: 'slot' },
]

const selected = ref('simple')
const recommended = computed(() => patterns.find(p => p.id === scenarios.find(s => s.id === selected.value)?.recommended))
</script>

<template>
  <div class="demo">
    <p class="badge">组件设计模式</p>

    <h4>选个需求场景</h4>
    <select v-model="selected" class="scenarios">
      <option v-for="s in scenarios" :key="s.id" :value="s.id">{{ s.label }}</option>
    </select>

    <div v-if="recommended" class="rec">
      <strong>推荐:</strong> {{ recommended.name }}
      <p class="desc">{{ recommended.desc }}</p>
      <p class="cx">复杂度: {{ '★'.repeat(recommended.complexity) }}{{ '☆'.repeat(5 - recommended.complexity) }}</p>
    </div>

    <h4>模式索引</h4>
    <ul class="patterns">
      <li v-for="p in patterns" :key="p.id" :class="{ hit: recommended && p.id === recommended.id }">
        <span class="name">{{ p.name }}</span>
        <span class="desc">{{ p.desc }}</span>
        <span class="cx">{{ '★'.repeat(p.complexity) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 540px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
h4 { font-size: 0.85rem; margin: 10px 0 4px; color: #444; }
.scenarios { width: 100%; padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.82rem; box-sizing: border-box; }
.rec { background: #eaf6f1; padding: 10px; border-radius: 8px; margin: 10px 0; }
.rec strong { color: #2c8e63; }
.desc { font-size: 0.78rem; color: #555; margin: 4px 0 0; }
.cx { font-size: 0.78rem; color: #b78103; margin: 4px 0 0; }
.patterns { list-style: none; padding: 0; margin: 0; }
.patterns li { display: grid; grid-template-columns: 140px 1fr 70px; gap: 8px; padding: 5px 10px; font-size: 0.78rem; border-bottom: 1px solid #f0f0f0; align-items: center; }
.patterns li.hit { background: #fff8e1; font-weight: 600; }
.name { color: #2c8e63; font-family: ui-monospace, monospace; }
.desc { color: #666; }
.cx { color: #b78103; text-align: right; }
</style>
