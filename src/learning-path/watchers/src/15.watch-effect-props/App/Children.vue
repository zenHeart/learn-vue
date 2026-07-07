<template>
  <div>
    <p>{{double}}</p>
    <p>{{state}}</p>
  </div>
</template>

<script>
import { reactive, computed, watchEffect } from 'vue';

export default {
  name: 'Children',
  props: {
    count: Number
  },
  setup(props) {
    const state = reactive({
      newCount: 0
    })
    watchEffect(() => {
      if(props.count > 4) {
        console.log('log', props.count, state.newCount)
        state.newCount = props.count;
      }
    })
    const double = computed(() => props.count*2 )
    
    return {
      double,
      state
    }
  }
};
</script>

<style scoped>
div {
  padding: 10px;
  border: 1px solid #ccc;
  margin: 10px;
}
</style> 