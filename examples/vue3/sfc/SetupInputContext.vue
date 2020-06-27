<template>
  <Example text="setup 第二个参数接收组件实例 context 属性">
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
  setup(props, context) {
    console.log('接收 context 属性', context);
  }
};
</script>
