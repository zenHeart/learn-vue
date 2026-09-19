<template>
  <div class="si">
    <div class="row">
      <span class="key">default 插槽已传入:</span>
      <span class="val">{{ hasDefault ? '是' : '否' }}</span>
    </div>
    <div class="row">
      <span class="key">extra 插槽已传入:</span>
      <span class="val">{{ hasExtra ? '是' : '否' }}</span>
    </div>
    <div class="row">
      <span class="key">item 数:</span>
      <span class="val">{{ items.length }}</span>
    </div>

    <slot v-if="hasDefault" :items="items" />
    <slot v-else name="empty" />
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = defineProps<{ items: unknown[] }>()
const slots = useSlots()

const hasDefault = computed(() => !!slots.default)
const hasExtra = computed(() => !!slots.extra)

defineSlots<{
  default(props: { items: unknown[] }): any
  empty(): any
  extra(): any
}>()
</script>

<style scoped>
.si { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
.row { display: flex; gap: 8px; padding: 2px 0; font-size: 13px; }
.key { color: #888; min-width: 130px; }
.val { color: #222; font-weight: 700; }
</style>
