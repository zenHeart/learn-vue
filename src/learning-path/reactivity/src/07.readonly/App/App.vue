<template>
  <Example text="使用 Readonly 限制响应式属性为只读">
    <button @click="() => state.count++">点击自增 {{ state.count }}</button>
    <p>{{ logState }}</p>
  </Example>
</template>

<script>
import { reactive, watchEffect, readonly } from 'vue';
import Example from '../components/Example.vue';

const state = reactive({
  count: 0
});
const logState = readonly(state);

export default {
  components: {
    Example
  },

  setup() {
    // 注意 watchEffext 必须访问具体属性才会触发回调
    watchEffect(() => {
      console.log(logState.count);
    });
    return {
      state,
      logState
    };
  },
  beforeCreate() {
    console.group('log readonly');
  },
  beforeDestroy() {
    console.groupEnd();
  }
};
</script>

<style lang="scss" scoped></style> 