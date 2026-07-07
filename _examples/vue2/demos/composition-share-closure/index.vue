<template>
  <div>
    <h1>闭包共享状态</h1>
    <C1></C1>
    <p><button @click="reset">reset</button> {{ state }}</p>
  </div>
</template>

<script>
import { useCount } from './business';
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
      ...useCount()
    };
  }
};
</script>
