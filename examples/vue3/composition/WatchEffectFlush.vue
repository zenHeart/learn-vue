<template>
  <Example text="使用 watchEffect 使用 flush 控制执行时机">
    <select v-model="flush">
      <option :key="option" v-for="option in options" v-bind:value="option">
        {{ option }}
      </option>
    </select>
    <button @click="showC1 ^= 1">显示隐藏</button>
    <button @click="count++">自增 {{ count }}</button>
    <C1 v-if="showC1" />
  </Example>
</template>

<script>
// TODO: flush 测试并未改变运行时间需处理
import Example from '../components/Example.vue';

import { ref, watchEffect, onMounted } from 'vue';
import { h } from '@vue/runtime-dom';

const count = ref(0);
const showC1 = ref(true);
const flush = ref('post');

let C1 = {
  render() {
    return h('h1', `count is: ${count.value}`);
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
  },
  beforeUpdate() {
    console.log('C1 before update');
  },
  updated() {
    console.log('C1 updated');
  },
  destroyed() {
    console.groupEnd();
  },
  setup() {
    console.group('%c flush', 'color:green');
    watchEffect(
      () => {
        console.log('watchEffect run time', flush.value);
        console.log('watchEffect count', count.value);
      },
      { flush }
    );
    return {
      count
    };
  }
};

export default {
  components: {
    Example,
    C1
  },
  data() {
    return {
      options: ['post', 'sync', 'pre']
    };
  },
  setup() {
    return {
      flush,
      showC1,
      count
    };
  }
};
</script>
