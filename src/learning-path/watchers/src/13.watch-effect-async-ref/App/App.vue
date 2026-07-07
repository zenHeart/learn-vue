<template>
  <div>
    <h1>watchEffect 无法追踪首次未追踪的异步依赖</h1>
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
      // 先执行异步事件，此处无法追踪
      // 外层需显示引用 count.value 触发追踪
      Promise.resolve().then(() => {
        console.log(`log count:`, count.value)
      })
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