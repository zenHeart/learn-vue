<template>
  <div class="demo">
    <h2>插槽 + Teleport + Suspense 组合</h2>

    <section class="card">
      <h3>1. 三组合：异步 Modal 渲染到 body</h3>
      <button @click="open1 = true">打开 Modal</button>

      <Suspense v-if="open1">
        <AsyncModal :title="'用户协议'">
          <template #default>
            <p>这是一份异步加载的协议内容...</p>
            <p>包含 <strong>{{ heavy }}</strong> 个字段</p>
          </template>
        </AsyncModal>
        <template #fallback>
          <div class="fb">加载 Modal 资源...</div>
        </template>
      </Suspense>
    </section>

    <section class="card">
      <h3>2. 嵌套 Slot + Teleport</h2>
      <button @click="open2 = true">打开第二个</button>
      <ModalWrapper v-if="open2" :open="open2" @close="open2 = false">
        <template #default>
          <p>把内容用 Teleport 渲染到 body</p>
          <p>DOM 实际位置：&lt;body&gt; 末尾</p>
        </template>
      </ModalWrapper>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AsyncModal from './AsyncModal.vue'
import ModalWrapper from './ModalWrapper.vue'

const open1 = ref(false)
const open2 = ref(false)
const heavy = 42
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.fb { padding: 16px; background: #f0f5ff; color: #1d39c4; text-align: center; border-radius: 4px; }
</style>
