<template>
  <section v-bind="attrs">
    <header>Wrapper header</header>
    <main>Wrapper content</main>
  </section>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

defineOptions({ name: 'Wrapper', inheritAttrs: false })

const attrs = useAttrs()
</script>

<style scoped>
section { padding: 8px; background: #fff; border-radius: 4px; border: 1px solid #ccc; }
header { padding: 4px 8px; background: #fafafa; border-radius: 3px; }
main { padding: 6px 8px; }
</style>
