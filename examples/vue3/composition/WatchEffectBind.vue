<template>
  <Example text="watchEffext 的触发条件验证">
    <button @click="showC1 ^= 1">
      隐藏显示组件
    </button>
    <button @click="showC2 ^= 1">
      隐藏显示组件
    </button>
    <button @click="count11++">点击自增</button>
    <C1 v-if="showC1" />
    <C2 v-if="showC2" />
  </Example>
</template>

<script>
// TODO: 单文件中不支持申明新的组件
import Example from '../components/Example.vue';

import { ref, createApp, watchEffect } from 'vue';
import { h } from '@vue/runtime-dom';

const showC1 = ref(true);
const showC2 = ref(true);
const count11 = ref(0);

let C1 = {
  render() {
    return h('h1', 'c1 组件');
  },
  setup() {
    watchEffect(() => {
      console.log('c1 组件');
    });
  }
};
let C2 = {
  render() {
    return h('h1', 'c2 组件');
  },
  setup() {
    watchEffect(() => {
      count11.value;
      console.log('c2 组件绑定了 count11');
    });
    watchEffect(() => {
      count11.value;
      console.log('c3 组件绑定了 count11');
    });
  }
};

export default {
  components: {
    Example,
    C1,
    C2
  },
  setup() {
    watchEffect(() => {
      console.log('parent');
    });
    return {
      showC1,
      showC2,
      count11
    };
  }
};
</script>
