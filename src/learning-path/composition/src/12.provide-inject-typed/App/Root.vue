<template>
  <div class="root">
    <p>主题: <span :style="{ color: theme.primary }">{{ theme.primary }}</span></p>
    <Leaf />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import type { Theme } from './keys'
import { ThemeKey, UserKey } from './keys'
import Leaf from './Leaf.vue'

const theme: Theme = { primary: '#1890ff', mode: 'light' }
provide(ThemeKey, theme)

provide(UserKey, { name: 'alice', level: 9 })
</script>

<style scoped>
.root { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
</style>
