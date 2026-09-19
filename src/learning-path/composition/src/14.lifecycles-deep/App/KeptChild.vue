<template>
  <div class="kc">
    <p>KeepAlive 子组件 ({{ counter }})</p>
    <p class="log" v-for="l in log" :key="l">{{ l }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated } from 'vue'

const counter = ref(0)
const log = ref<string[]>([])
const push = (s: string) => log.value.push(s)

onMounted(() => push('onMounted'))
onActivated(() => push('onActivated'))
onDeactivated(() => push('onDeactivated'))
</script>

<style scoped>
.kc { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
.log { font-size: 11px; color: #888; padding: 1px 0; margin: 0; }
</style>
