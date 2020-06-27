<template>
  <Example text="使用 watchEffect 添加属性监听器">
    <button @click="() => state.count++">改变 count {{ state.count }}</button>
  </Example>
</template>

<script>
import { reactive, watchEffect } from 'vue';
import Example from '../components/Example.vue';

const state = reactive({
  count: 0
});
watchEffect((...args) => {
  console.log(`count change ${state.count}`, args);
});

export default {
  components: {
    Example
  },
  setup() {
    return {
      state
    };
  }
};
</script>

<style lang="scss" scoped></style>
