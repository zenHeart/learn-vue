<template>
  <Example text="reactive 代理对象为响应式">
    <p>
      <button @click="increment">点击自增 {{ state.count }}</button>
    </p>
  </Example>
</template>

<script>
import Example from '../components/Example.vue';

import { reactive } from 'vue';
export default {
  components: {
    Example
  },
  setup() {
    let state = reactive({ count: 1 });
    return {
      state,
      increment() {
        state.count++;
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
