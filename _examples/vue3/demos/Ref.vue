<template>
  <Example text="ref 原始类型的响应式触发">
    <p>
      <button @click="increment">点击自增 {{ count }}</button>
    </p>
  </Example>
</template>

<script>
import Example from '../components/Example.vue';

import { ref } from 'vue';
export default {
  components: {
    Example
  },
  setup() {
    let count = ref(0);
    return {
      count,
      increment() {
        count.value++;
      }
    };
  },
  data() {
    return {
      a: 1
    };
  },
  methods: {
    inverse() {
      this.a ^= 1;
    }
  }
};
</script>

<style lang="scss" scoped></style>
