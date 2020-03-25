<template>
  <Example text="ref 直接监听即可">
    <button @click="count++">点击自增 {{ count }}</button>
  </Example>
</template>

<script>
import Example from '../components/Example.vue';
import { watch, ref } from 'vue';

const count = ref(0);
watch(count, (now, old) => {
  console.log(`now:${now},old:${old}`);
});

export default {
  components: {
    Example
  },
  setup() {
    return {
      count
    };
  }
};
</script>

<style lang="scss" scoped></style>
