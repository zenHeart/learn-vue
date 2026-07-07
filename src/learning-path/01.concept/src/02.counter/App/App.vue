<template>
    <button @click="increment">
      Count is: {{ state.count }}, double is: {{ state.double }}
    </button>
</template>

<script>
import { reactive, computed } from "vue";

export default {
  meta: {
    tags: ["basic"]
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