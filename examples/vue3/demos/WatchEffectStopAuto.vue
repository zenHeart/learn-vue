<template>
  <Example text="watchEffect 当组件销毁时会自动卸载事件">
    <button @click="show^=1">显示</button>
    <button @click="count++" >add</button>
    <WatchEffect :count="count" v-if="show"/>
  </Example>
</template>

<script>
import { ref } from 'vue';
import Example from '../components/Example.vue';
import WatchEffect from './WatchEffect.vue';


export default {
  meta: {
    tags:['watchEffect']
  },
  components: {
    Example,
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
