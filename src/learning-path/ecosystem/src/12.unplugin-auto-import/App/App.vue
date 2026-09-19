<script setup>
// 注意：这里没写任何 import。
// 真实项目里 unplugin-auto-import 会自动注入：
// import { ref, computed, onMounted } from 'vue'
// import { useMouse } from '@vueuse/core'

const count = ref(0)
const double = computed(() => count.value * 2)
const { x, y } = useMouse()
</script>

<template>
  <div class="card">
    <h2>unplugin-auto-import 自动 import</h2>
    <p class="hint">上面 <code>&lt;script setup&gt;</code> 里没写任何 import。真实项目里 unplugin 会注入。</p>

    <div class="grid">
      <div class="cell"><span class="label">count</span><span class="val">{{ count }}</span></div>
      <div class="cell"><span class="label">double</span><span class="val">{{ double }}</span></div>
      <div class="cell"><span class="label">mouse x</span><span class="val">{{ Math.round(x) }}</span></div>
      <div class="cell"><span class="label">mouse y</span><span class="val">{{ Math.round(y) }}</span></div>
    </div>

    <button class="primary" @click="count++">count++</button>

    <h3>自动生成的 import 预览</h3>
    <pre>import { ref, computed } from 'vue'
import { useMouse } from '@vueuse/core'

const count = ref(0)
const double = computed(() => count.value * 2)
const { x, y } = useMouse()</pre>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 460px; }
.card h2 { margin: 0 0 6px; font-size: 1.05rem; }
.card h3 { margin: 12px 0 6px; font-size: 0.9rem; }
.hint { font-size: 0.82rem; color: #666; margin: 0 0 10px; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.82rem; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 8px 0; }
.cell { background: #f6f8fa; border-radius: 8px; padding: 6px 10px; }
.label { display: block; font-size: 0.7rem; color: #888; }
.val { display: block; font-size: 1rem; font-weight: 700; color: #42b883; }
button.primary { padding: 6px 12px; border-radius: 6px; background: #42b883; color: #fff; border: 0; cursor: pointer; font-size: 0.85rem; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 0.78rem; overflow-x: auto; line-height: 1.6; }
</style>
