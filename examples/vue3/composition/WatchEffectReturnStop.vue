<template>
  <Example text="watchEffect 返回的函数可以终止观察">
    <button @click="count++">点击增加计数 {{ count }}</button>
    <button @click="stop">终止对 count 变化的观察</button>
  </Example>
</template>

<script>
// TODO: 单文件中不支持申明新的组件
import Example from '../components/Example.vue';

import { ref, watchEffect } from 'vue';

const count = ref(0);

const stop = watchEffect(() => {
  console.log(count.value);
});

export default {
  components: {
    Example
  },
  setup() {
    return {
      count,
      stop
    };
  }
};
</script>

<style lang="scss" scoped></style>
