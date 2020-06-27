<template>
  <Example text="computed 赋值为访问器属性设置 get set">
    <button @click="() => count++">
      改变 count {{ count }},追踪变化 double {{ double }}
    </button>
    <button @click="() => (double = 0)">
      reset count {{ count }},double {{ double }}
    </button>
  </Example>
</template>

<script>
import { ref, computed } from 'vue';
import Example from '../components/Example.vue';

const count = ref(0);

const double = computed({
  get: () => count.value ** 2,
  set: val => {
    console.log('reset', val);
    count.value = val;
  }
});

export default {
  components: {
    Example
  },
  setup() {
    return {
      double,
      count
    };
  }
};
</script>

<style lang="scss" scoped></style>
