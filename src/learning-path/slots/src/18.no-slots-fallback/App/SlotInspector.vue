<template>
  <div class="si">
    <div>default 插槽: <strong>{{ hasDefault ? '已传入' : '未传入' }}</strong></div>
    <div>extra 插槽: <strong>{{ hasExtra ? '已传入' : '未传入' }}</strong></div>

    <div class="content">
      <slot v-if="hasDefault" />
      <slot v-else name="empty">
        <p class="empty">空状态插槽 (默认 fallback)</p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const slots = useSlots()
const hasDefault = computed(() => !!slots.default)
const hasExtra = computed(() => !!slots.extra)
</script>

<style scoped>
.si { padding: 10px; background: #fff; border: 1px dashed #aaa; border-radius: 4px; margin-bottom: 6px; }
.content { margin-top: 8px; padding: 8px; background: #fafafa; border-radius: 4px; }
.empty { color: #888; font-style: italic; }
</style>
