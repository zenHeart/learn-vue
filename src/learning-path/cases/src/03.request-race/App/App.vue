<script setup lang="ts">
import { shallowRef, onUnmounted } from 'vue'
import { createLatestRequest } from './model.js'
const output = shallowRef('尚未运行'), pending = shallowRef(false)
const controller = createLatestRequest((r: {value: string | null, error: string | null}) => { output.value = r.error || r.value || '' })
onUnmounted(() => controller.dispose())
const response = (value: string, delay: number) => () => new Promise<string>(resolve => setTimeout(() => resolve(value), delay))
async function reproduce() {
 pending.value = true
 await Promise.all([controller.run(response('旧查询结果', 600)), controller.run(response('新查询结果', 50))])
 pending.value = false
}
</script>
<template>
  <h2>旧响应覆盖新响应</h2>
  <p>先预测最后留下哪条结果，再运行并修改 model.js。延迟由本地 Promise 模拟，未访问远程接口。</p>
  <button :disabled="pending" @click="reproduce">{{ pending ? '等待响应…' : '复现乱序响应' }}</button>
  <p role="status">{{ output }}</p>
</template>
