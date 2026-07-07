<template>
  <div class="basic-example">
    <h2>基础组件示例</h2>
    <button @click="increment">
      Count is: {{ state.count }}, double is: {{ state.double }}
    </button>
  </div>
</template>

<script>
import { reactive, computed } from "vue";

export default {
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

<style scoped>
.basic-example {
  padding: 20px;
  text-align: center;
}

button {
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
}

button:hover {
  background-color: #45a049;
}
</style> 