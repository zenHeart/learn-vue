<template>
  <Example text="setup 接收 props 属性">
    <p>{{ name }}</p>
  </Example>
</template>
<script>
import Example from '../components/Example.vue';

// TODO: 渲染函数如何使用响应数据
export default {
  components: {
    Example
  },
  props: {
    name: {
      type: String,
      defalut: 'default'
    }
  },
  setup(props) {
    console.log('接收 props 属性', props);
  }
};
</script>
