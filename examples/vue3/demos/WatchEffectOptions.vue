<template>
  <Example text="使用 watchEffect 监听数据变化">
    <button @click="count++">改变 data count {{ count }}</button>
  </Example>
</template>

<script>
import { ref, watchEffect } from 'vue';
import Example from '../components/Example.vue';


export default {
  meta: {
    tags:['watchEffect']
  },
  components: {
    Example
  },
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
