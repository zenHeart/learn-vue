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
    // 注意每次挂载该函数都会被替换
    function checkOverflow(n) {
      return () => {
        console.group('checkOverflow')
        if(count.value >= n) {
          count.value = 0
          console.log('value overflow')
          return false
        }
        console.groupEnd('checkOverflow')
      }
    }
    watchEffect((onInvalidator) => {
      console.group('watchEffect')
      // 注册溢出监测函数
      if(count.value > 2) {
        console.log('%c mount validator','border-bottom: 1px solid red')
        onInvalidator((checkOverflow(5)));
      }
      console.log(`data count change %c${count.value}`, 'color:green;font-size: 2rem');
      if(count.value >= 10) {
        console.log('trigger stop ,cancel watch')
      }
      console.groupEnd('watchEffect')
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