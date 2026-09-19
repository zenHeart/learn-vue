<template>
  <div class="dc">
    <div>深层子组件读到 globalCount: <strong>{{ globalCount }}</strong></div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { AppCountKey } from './keys'

const globalCount = inject(AppCountKey)!
</script>

<style scoped>
.dc { margin-top: 8px; padding: 8px; background: #fafafa; border-radius: 4px; border-left: 2px solid #722ed1; }
</style>
