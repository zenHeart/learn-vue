<template>
  <div>
    <button @click="state.count++">点击自增 {{ state.count }}</button>
    <button @click="state.count1++">点击自增 {{ state.count1 }}</button>
  </div>
</template>

<script>
import { watch, reactive } from 'vue';

const state = reactive({
  count: 1,
  count1: 1
});
watch(
  ['count', 'count1'].map(el => () => state[el]),
  ([c, c1], [oldC, oldC1]) => {
    console.log(
      `now  count:${c},count1:${c1}
       old: count:${oldC},count1:${oldC1}`
    );
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