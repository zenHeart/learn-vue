<template>
  <div>
    <h2>WatchEffect 组件</h2>
    <p>Count: {{ count }}</p>
  </div>
</template>

<script>
import { watchEffect } from 'vue';

export default {
  props: {
    count: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    watchEffect(() => {
      console.log('WatchEffect 组件中的 count:', props.count);
    });
  }
};
</script>

<style scoped>
div {
  padding: 10px;
  border: 1px solid #ccc;
  margin: 10px;
}
</style> 