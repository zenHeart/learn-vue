<template>
  <div class="child">
    <p>firstName = {{ firstName }}</p>
    <p>lastName = {{ lastName }}</p>
  </div>
</template>

<script setup>
defineProps({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true }
})
</script>

<style scoped>
.child {
  padding: 6px;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
  background: #fff;
}
</style>