<template>
  <Example text="product inject 实现深度传值">
    <button @click="count++">自增 {{ count }}</button>
    <Parent />
  </Example>
</template>

<script>
// TODO: 单文件中不支持申明新的组件
import Example from '../components/Example.vue';

import { ref, createApp, provide, inject } from 'vue';
import { h } from '@vue/runtime-dom';

const count = ref(0);

let Children = {
  render() {
    return h('div', `count:${this.t2}`);
  },
  setup() {
    let t2 = inject('ThemeSymbol', 2);
    return {
      t2
    };
  }
};
let Parent = {
  components: {
    Children
  },
  render() {
    return h('div', [h(Children), `count is: ${this.theme}`]);
  },
  setup() {
    // 支持默认值
    const theme = inject('ThemeSymbol', 0);
    console.log('-----theme:', theme);
    return {
      theme
    };
  }
};

export default {
  components: {
    Example,
    Parent
  },
  setup() {
    provide('ThemeSymbol', count);
    return {
      count
    };
  }
};
</script>
