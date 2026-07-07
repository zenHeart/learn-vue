<template>
  <div>
    <button @click="count++">改变 count {{ count }}</button>
    <button @click="count1++">改变 count1 {{ count1 }}</button>
    <C1 />
  </div>
</template>

<script>
import { ref, watchEffect, onMounted } from 'vue';
import { h } from '@vue/runtime-dom';

const count = ref(0);
const count1 = ref(0);

let C1 = {
  render() {
    return h('h1', `count is: ${count.value},count1 is: ${count1.value}`);
  },
  beforeUpdate() {
    console.log('beforeUpdate');
  },
  updated() {
    console.log('updated');
  },
  setup() {
    watchEffect(
      () => {
        console.log('watchEffect count', count.value);
      },
      {
        onTrigger(e) {
          console.log('onTrigger run  e:', e, count.value);
        },
        onTrack(e) {
          console.log('onTrack run  e:', e, count.value);
        }
      }
    );
    return {
      count,
      count1
    };
  }
};

export default {
  components: {
    C1
  },
  setup() {
    return {
      count,
      count1
    };
  }
};
</script>

<style scoped>
button {
  margin: 0 10px;
  padding: 5px 10px;
}
</style> 