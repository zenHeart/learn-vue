<script setup>
import { ref, provide, inject } from 'vue'

const mode = ref('broken')

// 错误：provide 普通值
const brokenCount = ref(0)
provide('brokenCount', 0)

// 修复：provide ref
const goodCount = ref(0)
provide('goodCount', goodCount)
</script>

<template>
  <div class="demo">
    <p class="badge">provide / inject 默认值</p>

    <div class="switch">
      <button :class="{ active: mode === 'broken' }" @click="mode = 'broken'">错误：provide 0</button>
      <button :class="{ active: mode === 'fixed' }" @click="mode = 'fixed'">修复：provide ref</button>
    </div>

    <Child :mode="mode" />

    <p class="tip">provide 啥，inject 拿啥；普通值无法触发响应式更新。</p>
  </div>
</template>

<script>
import { defineComponent, h, inject, ref } from 'vue'

const Child = defineComponent({
  name: 'Child',
  props: ['mode'],
  setup(props) {
    return () => h('div', { class: 'child' }, [
      h('h4', '子组件'),
      props.mode === 'broken'
        ? h(BrokenPanel)
        : h(FixedPanel),
    ])
  },
})

function BrokenPanel() {
  const count = inject('brokenCount', 0)
  return h('div', { class: 'panel bad' }, [
    h('p', `count = ${count} (普通 number)`),
    h('button', { onClick: () => count++ }, 'brokenCount++'),
    h('p', { class: 'tip' }, '改的是局部变量 count，不触发更新'),
  ])
}

function FixedPanel() {
  const count = inject('goodCount')
  return h('div', { class: 'panel good' }, [
    h('p', `count = ${count.value} (ref)`),
    h('button', { onClick: () => count.value++ }, 'goodCount.value++'),
    h('p', { class: 'tip' }, '改 ref.value 触发响应式'),
  ])
}

export default { components: { Child } }
</script>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fdecea; color: #c0392b; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.switch { display: flex; gap: 6px; margin-bottom: 10px; }
.switch button { flex: 1; padding: 5px 8px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.74rem; }
.switch button.active { background: #42b883; color: #fff; border-color: #42b883; }
:deep(.child) { background: #f6f8fa; padding: 10px; border-radius: 8px; }
:deep(.child h4) { font-size: 0.82rem; margin: 0 0 6px; }
:deep(.panel) { padding: 8px; border-radius: 6px; margin-bottom: 6px; }
:deep(.panel.bad) { background: #fff5f5; border: 1px solid #f5c6c6; }
:deep(.panel.good) { background: #f0fff4; border: 1px solid #c6e8d4; }
:deep(.panel p) { font-size: 0.78rem; margin: 0 0 6px; }
:deep(.panel button) { padding: 4px 10px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer; font-size: 0.74rem; }
:deep(.panel .tip) { font-size: 0.72rem; color: #888; margin-top: 4px; }
.tip { font-size: 0.78rem; color: #666; margin: 10px 0 0; }
</style>
