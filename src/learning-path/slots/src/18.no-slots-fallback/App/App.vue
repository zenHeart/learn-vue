<template>
  <div class="demo">
    <h2>插槽默认内容 + useSlots 检测</h2>

    <section class="card">
      <h3>1. 父组件不传插槽 → 显示默认内容</h3>
      <Card />
    </section>

    <section class="card">
      <h3>2. 父组件传入插槽 → 自定义内容</h3>
      <Card>
        <template #default>
          <p>这是来自父组件的插槽内容</p>
        </template>
      </Card>
    </section>

    <section class="card">
      <h3>3. 编程式 useSlots 检测</h3>
      <SlotInspector />
      <SlotInspector>
        <template #default>
          <p>已传入 default</p>
        </template>
      </SlotInspector>
    </section>
  </div>
</template>

<script setup lang="ts">
import Card from './Card.vue'
import SlotInspector from './SlotInspector.vue'
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
</style>
