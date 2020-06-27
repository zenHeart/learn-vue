<template>
  <Example text="支持采用 on* 的方式挂载组件生命周期钩子"> </Example>
</template>

<script>
import Example from '../components/Example.vue';
import {
  onRenderTriggered,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured
} from 'vue';

export default {
  components: {
    Example
  },
  setup() {
    onRenderTriggered(e => {
      console.log('debug e:', e);
    });

    onBeforeMount(() => {
      console.log('before mount');
    });
    onMounted(() => {
      console.log('mounted');
    });
    onBeforeUpdate(() => {
      console.log('onBeforeUpdate');
    });

    onUpdated(() => {
      console.log('onUpdated');
    });
    onBeforeUnmount(() => {
      console.log('onBeforeUnmount');
    });
    onUnmounted(() => {
      console.log('onUnmounted');
    });
    onErrorCaptured(() => {
      console.log('onErrorCaptured');
    });
  }
};
</script>

<style lang="scss" scoped></style>
