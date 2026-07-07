<template>
  <div>
    <h1>watchEffect 监测 ref 异步的变化</h1>
    <button @click="asyncAdd">{{ count }}</button>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const asyncAdd = () => Promise.resolve().then(() => { count.value++ })
    
    watchEffect(() => {
      console.log(`log count:`, count.value)
    })

    return {
      count,
      asyncAdd
    }
  }
};
</script>

<style scoped>
button {
  margin: 10px;
  padding: 5px 10px;
}
</style> 