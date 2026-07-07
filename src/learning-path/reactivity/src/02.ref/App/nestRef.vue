<script setup>
import { ref,watch } from 'vue'

const msg = ref({
  nest: {
    nest: [1,2,3]
  }
})

setInterval(() => {
  const a = msg.value.nest;
  a.nest = [Math.random()]
}, 2e3)

watch(() => msg.value.nest.nest, (newVal, old) => {
  console.log(newVal, old)
})

</script>

<template>
  <div>
    {{msg}}
  </div>
</template>
