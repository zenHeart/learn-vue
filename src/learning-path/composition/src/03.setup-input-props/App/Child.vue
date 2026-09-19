<template>
  <div class="child">
    <p>props.user.name = {{ user.name }}</p>
    <p>props.count = {{ count }}</p>
    <p>解构后 refCount (使用 toRefs) = {{ refCount }}</p>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  user: { type: Object, required: true },
  count: { type: Number, required: true }
})

const { user, count, count: refCount } = toRefs(props)
</script>

<style scoped>
.child {
  padding: 8px;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
  background: #fff;
  margin-bottom: 8px;
}
</style>