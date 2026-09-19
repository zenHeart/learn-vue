<template>
  <div class="bd">
    <p>当前 n = <strong>{{ n }}</strong></p>
    <p class="log" v-for="l in log" :key="l">{{ l }}</p>
  </div>
</template>

<script setup lang="ts">
import {
  onBeforeMount, onMounted,
  onBeforeUpdate, onUpdated,
  onBeforeUnmount, onUnmounted,
  ref,
} from 'vue'

defineProps<{ n: number }>()
const log = ref<string[]>([])

const push = (s: string) => log.value.push(`${new Date().toLocaleTimeString()} ${s}`)

onBeforeMount(() => push('onBeforeMount'))
onMounted(() => push('onMounted'))
onBeforeUpdate(() => push('onBeforeUpdate'))
onUpdated(() => push('onUpdated'))
onBeforeUnmount(() => push('onBeforeUnmount'))
onUnmounted(() => push('onUnmounted'))
</script>

<style scoped>
.bd { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
.log { font-size: 11px; color: #888; padding: 1px 0; margin: 0; }
</style>
