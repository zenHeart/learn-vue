<template>
  <div class="demo">
    <h2>KeepAlive 中插槽稳定性</h2>

    <section class="card">
      <h3>1. 父组件触发刷新 (子组件实例不变)</h3>
      <button @click="parentTick++">父组件 tick +1</button>
      <p>parentTick: {{ parentTick }}</p>
      <KeepAlive>
        <CachedComp>
          <template #default="{ note }">
            <div class="content">
              父组件 tick={{ parentTick }} → 子组件 note = <strong>{{ note }}</strong>
            </div>
          </template>
        </CachedComp>
      </KeepAlive>
      <p class="hint">父组件每次 render 会生成新的插槽函数，但子组件实例不变</p>
    </section>

    <section class="card">
      <h3>2. 缓存中修改父组件 prop</h3>
      <input v-model="greeting" />
      <KeepAlive>
        <CachedComp :label="greeting">
          <template #default>
            <p>插槽内容会随父组件 re-render 重新求值</p>
          </template>
        </CachedComp>
      </KeepAlive>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CachedComp from './CachedComp.vue'

const parentTick = ref(0)
const greeting = ref('hello')
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.content { padding: 8px 10px; background: #fff; border: 1px dashed #aaa; border-radius: 4px; }
</style>
