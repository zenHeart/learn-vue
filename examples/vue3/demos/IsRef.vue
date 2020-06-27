<template>
  <Example text="isRef 判断响应变量是否为 ref">
    <p>
      <button @click="increment">点击自增 {{ count }}</button>
    </p>
  </Example>
</template>

<script>
import Example from '../components/Example.vue';

import { ref, isRef } from 'vue';
export default {
  components: {
    Example
  },
  setup() {
    let count = ref(0);
    return {
      count,
      increment() {
        isRef(count) ? count.value++ : count++;
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
