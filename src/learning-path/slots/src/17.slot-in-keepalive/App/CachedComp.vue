<template>
  <div class="cc">
    <p>label (来自 prop): <strong>{{ label }}</strong></p>
    <p>mountTimes: {{ mountTimes }}</p>
    <slot :note="note" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onActivated, ref } from 'vue'

const props = defineProps<{ label?: string }>()
const note = ref('initial-note')
const mountTimes = ref(0)

onMounted(() => {
  mountTimes.value++
  console.log('[CachedComp] mounted, label =', props.label)
})
onActivated(() => {
  console.log('[CachedComp] activated')
})
</script>

<style scoped>
.cc { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
</style>
