<template>
  <Example text="computed 作为 state 的内部属性">
    <button @click="() => state.count++">
      改变 count {{ state.count }},追踪变化 double {{ state.double }}
    </button>
  </Example>
</template>

<script>
import { reactive, computed, watchEffect } from 'vue';
import Example from '../components/Example.vue';

const state = reactive({
  count: 0,
  double: computed(() => state.count * 2)
});

export default {
  components: {
    Example
  },
  setup() {
    watchEffect(() => {
      // 无需使用 value 访问
      console.log('double', state.double);
    });
    return {
      state
    };
  }
};
</script>

<style lang="scss" scoped></style> 