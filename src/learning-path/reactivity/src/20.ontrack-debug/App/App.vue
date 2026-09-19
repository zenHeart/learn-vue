<template>
  <section class="r20">
    <h2>onTrack / onTrigger 调试 + 循环引用修复</h2>

    <div class="card">
      <h3>① onTrack 收集依赖追踪</h3>
      <p>追踪事件数: {{ trackEvents.length }}</p>
      <p>最近 5 条:</p>
      <ul>
        <li v-for="(e, i) in trackEvents.slice(-5)" :key="i">
          {{ e }}
        </li>
      </ul>
      <button @click="bump">b.value++</button>
    </div>

    <div class="card">
      <h3>② onTrigger 通知追踪</h3>
      <p>通知事件数: {{ triggerEvents.length }}</p>
      <p>最近 5 条:</p>
      <ul>
        <li v-for="(e, i) in triggerEvents.slice(-5)" :key="i">
          {{ e }}
        </li>
      </ul>
      <button @click="bump">b.value++</button>
    </div>

    <div class="card warn">
      <h3>③ 循环引用 — 不修复会栈溢出</h3>
      <p>DOM 中安全替换，避免运行时炸栈：默认展示修复方案</p>
      <button @click="showBroken = !showBroken">
        切换 broken / fixed
      </button>
      <p v-if="showBroken">⚠️ 即将构造自引用 reactive：a.self === a</p>
      <p v-else>✅ 使用 markRaw / WeakRef 修复</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, effect, markRaw, shallowRef } from 'vue'

/* === ① ② onTrack / onTrigger === */
const b = ref(0)
const trackEvents = ref<string[]>([])
const triggerEvents = ref<string[]>([])

effect(() => {
  // 读取触发 onTrack
  void b.value
}, {
  onTrack(e) {
    trackEvents.value.push(`track ${String(e.target.constructor.name)}.${String(e.key)}`)
  },
  onTrigger(e) {
    triggerEvents.value.push(`trigger ${String(e.target.constructor.name)}.${String(e.key)} ${e.oldValue}->${e.newValue}`)
  }
})
function bump() { b.value++ }

/* === ③ 循环引用修复 === */
const showBroken = ref(false)

// 安全构造：使用 markRaw 阻止内部对象被代理
const fixed = markRaw({
  name: 'fixed-self-ref'
})
// 把 back ref 用 shallowRef 持有，避免 deep proxy
const selfHolder = shallowRef<any>(null)
selfHolder.value = fixed

// 不实际构造自引用 reactive（会栈溢出），仅在文档中说明
// const broken: any = reactive({ name: 'self' })
// broken.self = broken  // ❌ Maximum call stack
</script>

<style scoped>
.r20 { font-family: system-ui; padding: 1rem; }
.r20 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r20 .card.warn { border-color: #e08585; background: #fff5f5; }
.r20 ul { max-height: 120px; overflow: auto; font-size: 12px; padding-left: 1rem; }
.r20 button { margin-right: 0.4rem; }
</style>
