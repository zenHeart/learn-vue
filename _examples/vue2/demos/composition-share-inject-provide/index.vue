<template>
  <div>
    <h1>采用 inject 实现状态共享</h1>
    <C1></C1>
    <p><button @click="state.count = 0">reset</button> {{ state }}</p>
  </div>
</template>

<script>
import { provideState } from './business';
import C1 from './C1';
export default {
  meta: {
    tags: ['composition', 'share-state']
  },
  components: {
    C1
  },
  setup() {
    return {
      state: provideState()
    };
  }
};
</script>
