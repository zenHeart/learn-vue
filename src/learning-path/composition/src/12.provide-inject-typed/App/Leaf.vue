<template>
  <div class="leaf">
    <p>用户: {{ user?.name }} (等级 {{ user?.level }})</p>
    <p class="hint">类型是 UserInfo | undefined，需要可选链</p>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { UserKey, ThemeKey } from './keys'
import type { UserInfo, Theme } from './keys'

// 没有默认值时，类型为 UserInfo | undefined
const user = inject(UserKey)

// 第二个参数提供默认值，类型会收敛为 UserInfo
const theme = inject(ThemeKey, { primary: '#000', mode: 'light' } as Theme)
</script>

<style scoped>
.leaf { margin-top: 8px; padding: 10px; background: #fafafa; border-radius: 4px; }
.hint { font-size: 12px; color: #888; }
</style>
