<template>
  <div>
    <h1>函数式组件</h1>
    <render-test></render-test>
  </div>
</template>

<script>
import RenderTest from "./RenderTest.vue";
export default {
  name: "FunctionComponent",
  data() {
    return {
      parent: "FunctionComponent"
    };
  },
  components: {
    RenderTest
  }
};
</script>

<style scoped>
</style>