<template>
  <div class="demo">
    <h2>hasInjectionContext 跨组件边界</h2>

    <section class="card">
      <h4>① setup 内：hasInjectionContext === true</h4>
      <Child />
    </section>

    <section class="card">
      <h4>② 普通函数调用（脱离 setup）：false</h4>
      <p>普通 helper 中调用 hasInjectionContext：<strong>{{ outsideCtx }}</strong></p>
    </section>

    <section class="card">
      <h4>③ runWithContext：让普通函数拿到 inject</h4>
      <p class="hint">点击按钮触发 <code>setTimeout</code> 异步上下文，使用 <code>app.runWithContext</code> 让 inject 可用。</p>
      <button @click="onAsyncClick">异步读取主题</button>
      <p v-if="asyncTheme">异步拿到的 primary: <span class="swatch" :style="{ background: asyncTheme.primary }"></span></p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue'
import { hasInjectionContext, provide } from 'vue'
import { ThemeKey, useSafeInject } from './composables/useSafeInject.ts'
import Child from './Child.vue'

const outsideCtx = ref(false)
const asyncTheme = ref<{ primary: string } | null>(null)

onMounted(() => {
  const inst = getCurrentInstance()
  if (!inst) return
  const app = inst.appContext.app as any

  // ② 普通函数：脱离组件上下文
  const helper = () => hasInjectionContext()
  outsideCtx.value = helper()

  // ① 在 setup 阶段 provide 当前主题
  provide(ThemeKey, { primary: '#14b8a6' })

  // ③ 给按钮 click 用的 handler 绑定 app
  ;(window as any).__currentApp = app
})

function onAsyncClick() {
  const a = (window as any).__currentApp
  setTimeout(async () => {
    if (!a) return
    const theme = await a.runWithContext(async () => {
      const { ThemeKey } = await import('./composables/useSafeInject.ts')
      const { inject } = await import('vue')
      return inject(ThemeKey, { primary: '#000' })
    })
    asyncTheme.value = theme
  }, 0)
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 12px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h4 { margin: 0 0 8px; font-size: 14px; }
button { padding: 4px 12px; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; cursor: pointer; }
.swatch { display: inline-block; width: 24px; height: 14px; border-radius: 3px; vertical-align: middle; margin-left: 4px; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: 12px; }
.hint { font-size: 12px; color: #64748b; margin: 0 0 8px; }
</style>