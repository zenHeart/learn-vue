<template>
  <div class="demo">
    <h2>渲染函数 h() 与 JSX</h2>

    <section class="card">
      <h3>1. h() 渲染函数</h3>
      <HComponent />
    </section>

    <section class="card">
      <h3>2. JSX (TSX) 组件</h3>
      <JsxCounter />
    </section>

    <section class="card">
      <h3>3. 动态 VNode 树（DSL 风格）</h3>
      <DynamicTree :nodes="tree" />
    </section>
  </div>
</template>

<script setup lang="ts">
import HComponent from './HComponent.vue'
import JsxCounter from './JsxCounter.vue'
import DynamicTree from './DynamicTree.vue'

interface TreeNode { id: number; label: string; children?: TreeNode[] }
const tree: TreeNode[] = [
  { id: 1, label: 'root', children: [
    { id: 2, label: 'child A' },
    { id: 3, label: 'child B', children: [
      { id: 4, label: 'leaf' },
    ] },
  ] },
]
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
</style>
