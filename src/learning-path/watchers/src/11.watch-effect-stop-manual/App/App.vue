<template>
  <div>
    <p>数值大于 10 自动结束监听</p>
    <button @click="count++">改变 data count {{ count }}</button>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue';

export default {
  setup(props) {
    let count = ref(0)

    // 初始绑定便会触发回调执行
    const stop = watchEffect(() => {
      console.log(`data count change %c${count.value}`, 'color:green;font-size: 2rem');
      if(count.value >= 10) {
        stop()
        console.log('trigger stop ,cancel watch')
      }
    });
    return {
      count
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