<template>
  <div>
    <button @click="() => state.count++">改变 count {{ state.count }}</button>
    <Children :count="state.count"/>
  </div>
</template>

<script>
import { reactive, watchEffect } from 'vue';
import Children from './Children.vue';

const state = reactive({
  count: 0
});
watchEffect((...args) => {
  console.log(`count change ${state.count}`, args);
});

export default {
  components: {
    Children
  },
  setup() {
    return {
      state
    };
  }
};
</script>

<style scoped>
button {
  margin: 10px;
  padding: 5px 10px;
}
</style> 