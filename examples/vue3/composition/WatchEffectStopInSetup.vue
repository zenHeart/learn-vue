<template>
  <Example text=" 在 setup 使用 watchEffect 中会随组件卸载一起停止">
    <button @click="count++">add {{ count }}</button>
    <button @click="showC1 ^= 1">
      组件销毁时,setup 中的 watchEffect 也同时失效
    </button>
    <C1 v-if="showC1"></C1>
  </Example>
</template>

<script>
// TODO: 单文件中不支持申明新的组件
import Example from '../components/Example.vue';

import { ref, createApp, watchEffect } from 'vue';
import { h } from '@vue/runtime-dom';

const showC1 = ref(true);
const count = ref(0);

watchEffect(() => {
  console.log('watchEffect outside setup', count.value);
});

let C1 = {
  render() {
    return h('h1', 'demo');
  },
  setup() {
    watchEffect(() => {
      console.log('watchEffect in setup', count.value);
    });
  }
};

export default {
  components: {
    Example,
    C1
  },
  setup() {
    return {
      showC1,
      count
    };
  }
};
</script>

<style lang="scss" scoped></style>
