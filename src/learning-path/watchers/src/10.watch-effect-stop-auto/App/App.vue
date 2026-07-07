<template>
  <div>
    <button @click="show^=1">显示</button>
    <button @click="count++" >add</button>
    <WatchEffect :count="count" v-if="show"/>
  </div>
</template>

<script>
import { ref } from 'vue';
import WatchEffect from './WatchEffect.vue';

export default {
  components: {
    WatchEffect
  },
  setup() {
    const count = ref(0);
    const show = ref(0);
    return {
      count,
      show,
    };
  }
};
</script>

<style scoped>
button {
  margin: 10px;
  padding: 5px 10px;
}
</style> 