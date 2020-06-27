<template>
  <Example text="watch 监听变化">
    <button @click="state.count++">点击自增 {{ state.count }}</button>
  </Example>
</template>

<script>
import Example from '../components/Example.vue';
import { reactive, watch } from 'vue';

const state = reactive({
  count: 1
});

watch(
  () => state.count,
  (count, prevCount) => {
    console.log(`new:${count},old:${prevCount}`);
  }
);

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
