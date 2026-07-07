<template> </template>
<script>
import Example from '../components/Example.vue';

import { h, reactive } from 'vue';
const object = reactive({ count: 0 });

// TODO: 渲染函数如何使用响应数据
export default {
  components: {
    Example
  },
  setup() {
    return () =>
      h(Example, {
        text: 'setup 可以返回渲染函数'
      });
  }
};
</script>

<style lang="scss" scoped></style> 