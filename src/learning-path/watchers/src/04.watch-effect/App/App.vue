<template>
  <div>
    <button @click="count1++">改变 data count {{ count1 }}</button>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue';

export default {
  meta: {
    tags:['watchEffect']
  },
  props: {
    count: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    let count1 = ref(0)
    // 初始绑定便会触发回调执行
    watchEffect(() => {
      console.log(`props count change %c${props.count}`, 'color:red;font-size: 2rem');
    });

    // 初始绑定便会触发回调执行
    watchEffect(() => {
      console.log(`data count change %c${count1.value}`, 'color:green;font-size: 2rem');
    });
    return {
      count1
    }
  }
};
</script> 