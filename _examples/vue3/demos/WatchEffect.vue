<template>
  <Example text="使用 watchEffect 监听数据变化">
    <button @click="count1++">改变 data count {{ count1 }}</button>
  </Example>
</template>

<script>
import { ref, watchEffect } from 'vue';
import Example from '../components/Example.vue';


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
  components: {
    Example
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
