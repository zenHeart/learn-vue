<template>
    <div>
        <h1>逗号赋值属性</h1>
        <basic :a="a,b"></basic>
        <basic a="a,b"></basic>
    </div>
</template>
<script>
import basic from './basic.vue';
export default {
  components:{
    basic
  },
  data() {
    return {
      a: 1,
      b: [1, 2]
    };
  }
};
</script>

<style scoped>
</style>