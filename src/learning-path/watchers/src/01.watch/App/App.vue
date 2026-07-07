<template>
  <div>
    <button @click="state.count++">点击自增 {{ state.count }}</button>
  </div>
</template>

<script>
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
  setup() {
    return {
      state
    };
  }
};
</script>

<style lang="scss" scoped></style> 