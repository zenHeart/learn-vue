<template>
  <Example text="使用 computed 检测变化">
    <button @click="() => state.count++">
      改变 count {{ state.count }},追踪变化 double {{ double }}
    </button>
  </Example>
</template>

<script>
import { reactive, computed } from 'vue';
import Example from '../components/Example.vue';

const state = reactive({
  count: 0
});

const double = computed(() => state.count * 2);

export default {
  components: {
    Example
  },
  setup() {
    return {
      state,
      double
    };
  }
};
</script>

<style lang="scss" scoped></style>
