<template>
  <div class="child">
    <input :value="first" @input="first = $event.target.value" placeholder="first" />
    <input :value="last" @input="last = $event.target.value" placeholder="last" />
  </div>
</template>

<script setup>
import { useModel } from 'vue'

const props = defineProps(['first', 'last'])

// 自定义 event 名
const first = useModel(props, 'first', { event: 'update:first' })
const last = useModel(props, 'last', { event: 'update:last' })
</script>

<style scoped>
.child input { padding: 4px 8px; margin-right: 4px; }
</style>
