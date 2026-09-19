<script setup lang="ts">
import { shallowRef, onUnmounted } from 'vue'
import { reactive, effect, flush } from './model.js'
const state = reactive({ left: true, a: 1, b: 10 })
const trace = shallowRef<number[]>([])
const stop = effect(() => { trace.value = [...trace.value, state.left ? state.a : state.b] })
onUnmounted(stop)
async function change() { state.a++; state.a++; await flush() }
async function branch() { state.left = !state.left; await flush() }
</script>
<template>
  <h2>观察订阅与微任务</h2>
  <p>预测：连续两次修改 a，会新增几次观察结果？切换到 b 后，再改 a 呢？</p>
  <button @click="change">连续修改 a 两次</button>
  <button @click="branch">切换依赖分支</button>
  <button @click="stop">停止观察</button>
  <p role="status">实际运行轨迹：{{ trace.join(' → ') }}</p>
</template>
