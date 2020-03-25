<template>
  <Example text="setup 配置混入内容会和默认申明属性合并">
    <p>
      <button @click="inverse">返回内部属性 {{ a }}</button>
    </p>
    <p>
      <button @click="increment">setup 属性 {{ state }}</button>
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
