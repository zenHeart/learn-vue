<template>
  <Teleport to="body">
    <div class="modal-mask" @click.self="$emit('close')">
      <div class="modal-body">
        <h4>{{ title }} (async loaded)</h4>
        <slot />
        <button @click="$emit('close')">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
defineEmits<{ (e: 'close'): void }>()

// async setup 触发外层 Suspense
const data = await new Promise<{ items: string[] }>((r) =>
  setTimeout(() => r({ items: ['a', 'b', 'c'] }), 800)
)
console.log('[AsyncModal] loaded', data.items.length)
</script>

<style scoped>
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-body { background: #fff; padding: 20px; border-radius: 6px; min-width: 320px; }
button { margin-top: 12px; padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
