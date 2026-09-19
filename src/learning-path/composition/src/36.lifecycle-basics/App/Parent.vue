<template>
  <section class="parent">
    <h4>父组件</h4>
    <button @click="count++">父 count++</button>
    <button @click="show = !show">{{ show ? '卸载子' : '挂载子' }}</button>
    <span class="badge">{{ count }}</span>
    <Child v-if="show" :count="count" />
    <pre>{{ log.join('\n') }}</pre>
  </section>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue'
import Child from './Child.vue'

const count = ref(0)
const show = ref(true)
const log = ref<string[]>([])

function record(s: string) { log.value.push(s) }

onBeforeMount(() => record('[parent] beforeMount'))
onMounted(() => record('[parent] mounted'))
onBeforeUpdate(() => record('[parent] beforeUpdate'))
onUpdated(() => record('[parent] updated'))
onBeforeUnmount(() => record('[parent] beforeUnmount'))
onUnmounted(() => record('[parent] unmounted'))
</script>

<style scoped>
.parent {
  padding: 12px;
  background: #eef2ff;
  border-radius: 6px;
  margin-bottom: 12px;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 6px;
}
.badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  background: #6366f1;
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
}
pre {
  margin-top: 8px;
  padding: 8px;
  background: #1e293b;
  color: #f1f5f9;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.55;
  max-height: 180px;
  overflow: auto;
}
</style>