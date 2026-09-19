<script setup>
import { computed, ref, h, defineComponent, watch, onMounted } from 'vue'

// ---------- 1. Token 表 ----------
const baseTheme = {
  primary: '#42b883',
  primaryHover: '#5cc496',
  primaryPressed: '#339966',
  textBase: '#213547',
  textInverse: '#ffffff',
  bgBase: '#ffffff',
  bgSubtle: '#f6f8fa',
  borderBase: '#dcdfe6',
  radiusBase: '6px',
  fontSizeBase: '14px',
}

// ---------- 2. 三个预设主题 ----------
const presets = {
  light: {
    ...baseTheme,
    primary: '#42b883', primaryHover: '#5cc496', primaryPressed: '#339966',
    textBase: '#213547', textInverse: '#ffffff', bgBase: '#ffffff', bgSubtle: '#f6f8fa',
  },
  dark: {
    ...baseTheme,
    primary: '#5cc496', primaryHover: '#7dd3a8', primaryPressed: '#42b883',
    textBase: '#e6edf3', textInverse: '#0d1117', bgBase: '#0d1117', bgSubtle: '#161b22',
    borderBase: '#30363d',
  },
  contrast: {
    ...baseTheme,
    primary: '#ffd400', primaryHover: '#ffe455', primaryPressed: '#cc9900',
    textBase: '#000000', textInverse: '#000000', bgBase: '#ffff00', bgSubtle: '#fff8b0',
    borderBase: '#000000', radiusBase: '0',
  },
}

// ---------- 3. createTheme：合并 + 扁平化 ----------
const camelToKebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())

const createTheme = (overrides = {}) => {
  return { ...baseTheme, ...overrides }
}

const themeToCssVars = (theme, prefix = '--c') => {
  const out = {}
  for (const [k, v] of Object.entries(theme)) out[`${prefix}-${camelToKebab(k)}`] = v
  return out
}

// ---------- 4. 状态 ----------
const currentPreset = ref('light')
const userOverride = ref({})    // 用户运行时覆盖
const mergedTheme = computed(() => createTheme({ ...presets[currentPreset.value], ...userOverride.value }))
const cssVars = computed(() => themeToCssVars(mergedTheme.value))

// 把变量写到 :root，方便 DevTools 看
onMounted(() => {
  watch(cssVars, (v) => {
    const root = document.documentElement
    for (const [k, val] of Object.entries(v)) root.style.setProperty(k, val)
  }, { immediate: true, deep: true })
})

// ---------- 5. 演示组件：消费 token ----------
const ThemedButton = defineComponent({
  name: 'ThemedButton',
  props: { type: { type: String, default: 'primary' } },
  setup(props, { slots }) {
    return () => h('button', {
      class: ['themed-btn', `themed-btn--${props.type}`],
    }, slots.default?.())
  },
})

const ThemedCard = defineComponent({
  name: 'ThemedCard',
  setup(_, { slots }) {
    return () => h('div', { class: 'themed-card' }, slots.default?.())
  },
})

// ---------- 6. 控制台 ----------
const randomColor = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
const randomizePrimary = () => { userOverride.value = { ...userOverride.value, primary: randomColor(), primaryHover: randomColor() } }
const resetOverride = () => { userOverride.value = {} }
</script>

<template>
  <div class="demo">
    <p class="title">03 · CSS 变量主题系统（Naive UI 范式）</p>

    <div class="panel">
      <p class="panel-title">主题预设</p>
      <div class="controls">
        <button :class="{ active: currentPreset === 'light' }" @click="currentPreset = 'light'">Light</button>
        <button :class="{ active: currentPreset === 'dark' }" @click="currentPreset = 'dark'">Dark</button>
        <button :class="{ active: currentPreset === 'contrast' }" @click="currentPreset = 'contrast'">High Contrast</button>
        <button @click="randomizePrimary">随机 primary</button>
        <button @click="resetOverride">清除覆盖</button>
      </div>
      <p class="meta">当前 token 数：<code>{{ Object.keys(mergedTheme).length }}</code> · 当前 primary：<code>{{ mergedTheme.primary }}</code></p>
    </div>

    <ThemedCard>
      <p class="card-title">实时主题预览</p>
      <p class="card-text">这段文字与按钮用 CSS 变量驱动。切换预设不会重渲组件树，只改 <code>:root</code> 上的 <code>--c-*</code>。</p>
      <div class="row">
        <ThemedButton>Primary</ThemedButton>
        <ThemedButton type="default">Default</ThemedButton>
        <ThemedButton type="ghost">Ghost</ThemedButton>
      </div>
    </ThemedCard>

    <div class="token-table">
      <p class="panel-title">当前 token</p>
      <table>
        <thead>
          <tr><th>key</th><th>value</th><th>CSS 变量</th></tr>
        </thead>
        <tbody>
          <tr v-for="(v, k) in mergedTheme" :key="k">
            <td><code>{{ k }}</code></td>
            <td><code>{{ v }}</code></td>
            <td><code>--c-{{ camelToKebab(k) }}</code></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 12px; color: var(--c-text-base); background: var(--c-bg-base); max-width: 640px; }
.title { font-weight: 700; font-size: 1rem; margin: 0 0 10px; }
.panel { background: var(--c-bg-subtle); border: 1px solid var(--c-border-base); border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
.panel-title { margin: 0 0 6px; font-size: 0.85rem; font-weight: 600; }
.controls { display: flex; gap: 6px; flex-wrap: wrap; }
.controls button { padding: 5px 12px; border-radius: 4px; border: 1px solid var(--c-border-base); background: var(--c-bg-base); color: var(--c-text-base); cursor: pointer; font-size: 0.82rem; transition: background 0.15s; }
.controls button.active { background: var(--c-primary); color: var(--c-text-inverse); border-color: var(--c-primary); }
.meta { font-size: 0.76rem; color: var(--c-text-base); opacity: 0.7; margin: 8px 0 0; }
code { background: rgba(0, 0, 0, 0.06); padding: 1px 5px; border-radius: 3px; font-size: 0.78rem; }

.themed-card { background: var(--c-bg-base); border: 1px solid var(--c-border-base); border-radius: var(--c-radius-base); padding: 12px; margin-bottom: 10px; }
.card-title { margin: 0 0 4px; font-size: 0.9rem; font-weight: 700; color: var(--c-primary); }
.card-text { font-size: 0.82rem; margin: 0 0 10px; line-height: 1.6; }

.row { display: flex; gap: 6px; }
:deep(.themed-btn) {
  padding: 7px 14px; border-radius: var(--c-radius-base); cursor: pointer; font-size: 0.85rem;
  border: 1px solid var(--c-primary); background: var(--c-primary); color: var(--c-text-inverse);
  transition: background 0.15s, transform 0.1s;
}
:deep(.themed-btn:hover) { background: var(--c-primary-hover); }
:deep(.themed-btn:active) { background: var(--c-primary-pressed); transform: scale(0.97); }
:deep(.themed-btn--default) { background: var(--c-bg-base); color: var(--c-text-base); border-color: var(--c-border-base); }
:deep(.themed-btn--default:hover) { background: var(--c-bg-subtle); }
:deep(.themed-btn--ghost) { background: transparent; color: var(--c-primary); }
:deep(.themed-btn--ghost:hover) { background: var(--c-bg-subtle); }

.token-table table { width: 100%; border-collapse: collapse; font-size: 0.76rem; }
.token-table th, .token-table td { padding: 4px 8px; border-bottom: 1px solid var(--c-border-base); text-align: left; }
.token-table th { background: var(--c-bg-subtle); font-weight: 600; }
</style>
