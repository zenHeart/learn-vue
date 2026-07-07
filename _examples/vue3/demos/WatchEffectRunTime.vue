<template>
  <Example text="watchEffext 的执行时机早于 mounted">
    <button @click="showC1 ^= 1">
      隐藏显示组件
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

let C1 = {
  render() {
    return h('h1', 'demo');
  },
  beforeCreate() {
    console.log('C1 before created');
  },
  created() {
    console.log('C1  created');
  },
  beforeMount() {
    console.log('C1 before mount');
  },
  mounted() {
    console.log('C1 mounted');
    console.groupEnd();
  },
  setup() {
    watchEffect(() => {
      console.group(
        '%c watchEffect 早于所有钩子执行',
        'color:red;font-size:1.5rem'
      );
      console.log('watchEffect run');
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
      showC1
    };
  }
};
</script>
