<script setup>
import { reactive, watch } from 'vue'

const state = reactive({
  user: { name: 'A', addr: { city: 'BJ', zip: '100000' } },
  meta: { tag: 'x' },
})

const logs = ref([])
function log(msg) {
  logs.value.unshift(msg)
  if (logs.value.length > 8) logs.value.length = 8
}
import { ref } from 'vue'

// 错误版本：deep:true
watch(state, () => log('deep:true 全对象触发'), { deep: true })

// 修复版本 1：deep: number
watch(() => state.user, () => log('deep:2 user 触发'), { deep: 2 })

// 修复版本 2：getter 精确字段
watch(() => state.user.name, (v) => log(`name 变更为 ${v}`))

function changeCity() {
  state.user.addr.city = state.user.addr.city === 'BJ' ? 'SH' : 'BJ'
  log(`设置 city=${state.user.addr.city}`)
}
function changeName() {
  state.user.name = state.user.name + '*'
}
</script>

<template>
  <div class="demo">
    <p class="badge">watch deep 范围</p>

    <div class="state">
      user.name = <strong>{{ state.user.name }}</strong><br />
      user.addr.city = <strong>{{ state.user.addr.city }}</strong>
    </div>

    <div class="actions">
      <button @click="changeCity">改 city (第 3 层)</button>
      <button class="primary" @click="changeName">改 name (第 2 层)</button>
    </div>

    <h4>回调日志</h4>
    <ul class="log">
      <li v-for="(l, i) in logs" :key="i">{{ l }}</li>
    </ul>
    <p class="tip">改 city 只触发 deep:true，deep:2 因超过深度不触发。</p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fdecea; color: #c0392b; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.state { background: #f6f8fa; padding: 10px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 10px; }
.actions { display: flex; gap: 6px; margin-bottom: 10px; }
button { padding: 5px 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
h4 { font-size: 0.85rem; margin: 8px 0 4px; color: #444; }
.log { list-style: none; padding: 6px 10px; margin: 0; background: #f6f8fa; border-radius: 6px; font-size: 0.74rem; max-height: 140px; overflow-y: auto; font-family: ui-monospace, monospace; }
.log li { padding: 1px 0; }
.tip { font-size: 0.78rem; color: #666; margin: 8px 0 0; }
</style>
