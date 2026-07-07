<template>
  <div>
    <button @click="count++">改变 data count {{ count }}</button>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue';

export default {
  setup(props) {
    let count = ref(0)
    // 初始绑定便会触发回调执行
    watchEffect(() => {
      console.log(`data count change %c${count.value}`, 'color:green;font-size: 2rem');
    }, {
      flush: 'post'
    });
    return {
      count
    }
  },
  beforeUpdate() {
    console.log("beforeUpdate ------")
  }
};
</script>

<style scoped>
button {
  margin: 10px;
  padding: 5px 10px;
}
</style> 