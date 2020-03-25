<template>
  <Example text="toRefs 将响应式对象拆解为独立响应式元素">
    <p>
      <button @click="increment">结构响应式导致响应丢失 {{ foo }}</button>
      <button @click="increment1">
        toRefs 是每个元素均为索引方式避免丢失 {{ foo1 }}
      </button>
    </p>
  </Example>
</template>

<script>
import Example from '../components/Example.vue';

import { reactive, toRefs } from 'vue';
const state = reactive({
  foo: 1,
  bar: 2
});
export default {
  components: {
    Example
  },
  setup() {
    let { foo } = state;
    let { foo: foo1 } = toRefs(state);
    return {
      foo,
      foo1,
      increment() {
        foo++;
      },
      increment1() {
        foo1.value++;
      }
    };
  }
};
</script>

<style lang="scss" scoped></style>
