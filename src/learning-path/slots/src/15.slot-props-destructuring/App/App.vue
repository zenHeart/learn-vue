<template>
  <div class="demo">
    <h2>插槽 props 解构 + 默认值 + 重命名</h2>

    <section class="card">
      <h3>1. 解构 + 默认值</h3>
      <List :items="items">
        <template #default="{ item, index, separator: sep = '-' }">
          {{ index }}{{ sep }}{{ item }}
        </template>
      </List>
    </section>

    <section class="card">
      <h3>2. 解构 + 重命名</h3>
      <List :items="items">
        <template #default="{ item: name, index: i }">
          {{ i }} - {{ name }}
        </template>
      </List>
    </section>

    <section class="card">
      <h3>3. 解构默认值生效场景</h3>
      <Card>
        <template #default="{ title: t = '默认标题', desc: d = '默认描述' }">
          <h4>{{ t }}</h4>
          <p>{{ d }}</p>
        </template>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import List from './List.vue'
import Card from './Card.vue'
import { ref } from 'vue'

const items = ref(['Apple', 'Banana', 'Cherry'])
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
</style>
