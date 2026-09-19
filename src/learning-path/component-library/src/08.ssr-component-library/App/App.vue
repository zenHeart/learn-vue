<script setup>
import { ref, h, defineComponent, onMounted } from 'vue'

// ---------- 1. useIsClient composable ----------
const useIsClient = () => {
  if (typeof window === 'undefined') return false
  return true
}

const isClientRef = ref(false)
onMounted(() => { isClientRef.value = true })

// ---------- 2. ClientOnly 包装器 ----------
const ClientOnly = defineComponent({
  name: 'ClientOnly',
  setup(_, { slots }) {
    return () => isClientRef.value
      ? (slots.default?.() ?? null)
      : (slots.fallback?.() ?? null)
  },
})

// ---------- 3. 模拟 DOM-only 组件 ----------
// 真实场景下用了 getBoundingClientRect / window.scrollY 等
const FloatingTooltip = defineComponent({
  name: 'FloatingTooltip',
  props: { text: String },
  setup(props) {
    // 模拟一个用了 window 的副作用
    const pos = ref({ top: 0, left: 0 })
    onMounted(() => {
      // 真实代码：const rect = el.getBoundingClientRect()
      pos.value = { top: 100, left: 200 }
    })
    return () => h('div', { class: 'floating-tooltip', style: pos.value }, `Tooltip: ${props.text}`)
  },
})

// ---------- 4. 模拟 hydration mismatch 演示 ----------
const useNow = () => {
  // 服务端渲染时是 A 时间；客户端 hydrate 时变成 B 时间 → mismatch
  return new Date().toLocaleTimeString()
}

const mismatchDemo = ref(false)
const renderTime = ref('')

const triggerMismatch = () => {
  mismatchDemo.value = true
  renderTime.value = useNow()
}

// ---------- 5. 模拟 SSR config provider ----------
const ssrConfig = ref({
  locale: 'zh-CN',
  size: 'default',
  ssrHint: '这是 server 注入的初始 config，client 不会重置',
})

// ---------- 6. 控制台 ----------
const showFloating = ref(false)
const tooltipText = ref('悬停元素')
const showMismatch = ref(false)
</script>

<template>
  <div class="demo">
    <p class="title">08 · 组件库 SSR 适配</p>

    <!-- SSR vs Client 状态 -->
    <div class="panel">
      <p class="panel-title">环境状态</p>
      <p class="status">
        <span class="badge" :class="isClientRef ? 'on' : 'off'">{{ isClientRef ? 'CLIENT' : 'SERVER' }}</span>
        <code>typeof window</code> = <code>{{ typeof window }}</code>
        <code>typeof document</code> = <code>{{ typeof document }}</code>
      </p>
      <p class="meta">切换到不同运行模式：默认 server 状态，点击「模拟 hydrate」后切到 client</p>
      <div class="controls">
        <button @click="isClientRef = false">回到 server 模拟</button>
        <button class="primary" @click="isClientRef = true">模拟 hydrate (client)</button>
      </div>
    </div>

    <!-- DOM-only 组件 -->
    <div class="panel">
      <p class="panel-title">场景 ① · DOM-only 组件</p>
      <p class="meta">FloatingTooltip 用 getBoundingClientRect —— server 直接渲染会炸</p>
      <button @click="showFloating = !showFloating">{{ showFloating ? '隐藏' : '显示' }} Tooltip</button>
      <ClientOnly>
        <FloatingTooltip v-if="showFloating" :text="tooltipText" />
        <template #fallback>
          <div class="skeleton">[Server 占位] Tooltip 会在 hydrate 后出现</div>
        </template>
      </ClientOnly>
      <div class="controls">
        <input v-model="tooltipText" placeholder="tooltip 文本" />
      </div>
    </div>

    <!-- Hydration mismatch -->
    <div class="panel">
      <p class="panel-title">场景 ② · Hydration mismatch</p>
      <p class="meta">当 server / client 输出不一致时控制台红字警告</p>
      <button @click="triggerMismatch">触发 mismatch 场景</button>
      <ClientOnly>
        <div v-if="mismatchDemo" class="mismatch">
          <p>client 端时间：<strong>{{ renderTime }}</strong></p>
          <p class="hint">server 渲染时这里是另一时间 —— Vue 检测到不匹配，会在控制台报错</p>
        </div>
        <template #fallback>
          <div class="skeleton">[Server 占位]</div>
        </template>
      </ClientOnly>
      <pre v-if="mismatchDemo" class="console-error">Hydration node mismatch:
- rendered on server: "server-time-XX:XX:XX"
- expected on client: "{{ renderTime }}"</pre>
    </div>

    <!-- Element Plus SSR config provider -->
    <div class="panel">
      <p class="panel-title">场景 ③ · ConfigProvider SSR 字段</p>
      <p class="meta">Element Plus 的 size / locale 在 SSR 与 client 共享 config，不重置</p>
      <div class="config-display">
        <div class="config-row"><span>locale</span><code>{{ ssrConfig.locale }}</code></div>
        <div class="config-row"><span>size</span><code>{{ ssrConfig.size }}</code></div>
        <div class="config-row"><span>ssrHint</span><code class="ssr-tag">{{ ssrConfig.ssrHint }}</code></div>
      </div>
      <button @click="ssrConfig.locale = ssrConfig.locale === 'zh-CN' ? 'en-US' : 'zh-CN'">
        切换 locale（演示 client 覆盖 server 值）
      </button>
    </div>

    <!-- 修复清单 -->
    <div class="panel">
      <p class="panel-title">常见错误 → 修复</p>
      <table class="fix-table">
        <thead><tr><th>错误</th><th>修复</th></tr></thead>
        <tbody>
          <tr><td><code>document is not defined</code></td><td>setup 内同步访问移入 <code>onMounted</code></td></tr>
          <tr><td><code>Hydration node mismatch</code></td><td>避免 Date.now / Math.random / localStorage 在 SSR 中输出</td></tr>
          <tr><td><code>getBoundingClientRect of null</code></td><td>包 <code>&lt;ClientOnly&gt;</code> 或 <code>v-if="isClient"</code></td></tr>
          <tr><td><code>Cannot read property 'addEventListener'</code></td><td>window.addEventListener 移入 onMounted</td></tr>
          <tr><td>CSS 闪烁 / 错位</td><td>配 SSR extract 插件（<code>vite-plugin-vue-ssr</code>）</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 640px; }
.title { font-weight: 700; font-size: 1rem; margin: 0 0 10px; }
.panel { background: #f6f8fa; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
.panel-title { margin: 0 0 6px; font-size: 0.85rem; font-weight: 600; }
.status { font-size: 0.82rem; margin: 0 0 6px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; }
.badge.on { background: #42b883; color: #fff; }
.badge.off { background: #f56c6c; color: #fff; }
.meta { font-size: 0.78rem; color: #666; margin: 0 0 8px; }
.controls { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.controls button, .panel > button { padding: 5px 12px; border-radius: 4px; border: 1px solid #dcdfe6; background: #fff; cursor: pointer; font-size: 0.78rem; }
.controls button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.skeleton { padding: 8px 12px; background: #fff8e1; border: 1px dashed #ffc107; border-radius: 4px; font-size: 0.82rem; color: #856404; margin-top: 6px; }
.mismatch { padding: 8px 12px; background: #fef0f0; border-left: 3px solid #f56c6c; border-radius: 4px; margin-top: 6px; }
.mismatch p { margin: 0; font-size: 0.82rem; }
.mismatch .hint { font-size: 0.76rem; color: #666; margin-top: 4px; }
.console-error { background: #1f2937; color: #f87171; padding: 10px 12px; border-radius: 6px; font-size: 0.74rem; margin-top: 8px; overflow-x: auto; white-space: pre-wrap; }

.config-display { display: flex; flex-direction: column; gap: 4px; margin: 6px 0 8px; }
.config-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; background: #fff; border-radius: 4px; font-size: 0.82rem; }
.config-row .ssr-tag { background: #42b883; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 0.72rem; }

.fix-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.fix-table th, .fix-table td { padding: 6px 10px; border-bottom: 1px solid #e4e7ed; text-align: left; vertical-align: top; }
.fix-table th { background: #fff; font-weight: 600; }
.fix-table td:first-child { width: 45%; }

code { background: rgba(0, 0, 0, 0.06); padding: 1px 5px; border-radius: 3px; font-size: 0.78rem; color: #5b21b6; }

:deep(.floating-tooltip) {
  position: relative; display: inline-block; margin-top: 8px;
  padding: 6px 12px; background: #1f2937; color: #fff; border-radius: 4px; font-size: 0.78rem;
}
</style>
