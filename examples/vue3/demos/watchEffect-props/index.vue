<template>
  <Example text="使用 watchEffect 监听 props 变化">
    <button @click="() => state.count++">改变 count {{ state.count }}</button>
    <Children :count="state.count"/>
  </Example>  
</template>

<script>
import { reactive, watchEffect } from 'vue';
import Example from '../../components/Example.vue';
import Children from './Children.vue';

const state = reactive({
  count: 0
});
watchEffect((...args) => {
  console.log(`count change ${state.count}`, args);
});

export default {
  components: {
    Example,
    Children
  },
  meta: {
    tags: [ 'watchEffect' ]
  },
  setup() {
    return {
      state
    };
  }
};
</script>