<template>
  <section class="child">
    <h4>子组件（setup 内）</h4>
    <p>hasInjectionContext: <strong>{{ inCtx }}</strong></p>
    <p>主题 primary: <span class="swatch" :style="{ background: theme?.primary }"></span></p>
  </section>
</template>

<script setup lang="ts">
import { hasInjectionContext, inject } from 'vue'
import { ThemeKey } from './composables/useSafeInject.ts'

const inCtx = hasInjectionContext()
const theme = inject(ThemeKey, { primary: '#ccc' })
</script>

<style scoped>
.child { padding: 12px; background: #fef9c3; border-radius: 6px; font-size: 13px; }
h4 { margin: 0 0 6px; font-size: 14px; }
.swatch { display: inline-block; width: 24px; height: 14px; border-radius: 3px; vertical-align: middle; margin-left: 4px; }
strong { color: #92400e; }
</style>