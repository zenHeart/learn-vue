<template>
  <span v-if="mounted"><slot /></span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const mounted = ref(false)
onMounted(() => { mounted.value = true })
</script>