<template>
  <Example text="基本示例">
    <button @click="increment">
      Count is: {{ state.count }}, double is: {{ state.double }}
    </button>
  </Example>
</template>

<script>
import { reactive, computed } from 'vue';
import Example from '../components/Example.vue';

export default {
  components: {
    Example
  },
  setup() {
    const state = reactive({
      count: 0,
      double: computed(() => state.count * 2)
    });

    function increment() {
      state.count++;
    }

    return {
      state,
      increment
    };
  }
};
</script>
