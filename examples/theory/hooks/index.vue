<template>
    <div>
      <h3>测试可以在子组件上绑定 @hook 事件</h3>
      <children @hook:mounted="childrenHook('子组件 1 钩子')"></children>
      <button @click="showFlag^=1">
        触发子组件钩子
      </button>
        <children v-if="showFlag" @hook:mounted="childrenHook('显示时触发子组件 2 钩子')"></children>
    </div>
</template>

<script>
import Children from "./Children.vue";


export default {
  components: {
    Children,
  },
  data() {
    return {
      showFlag:false
    }
  },
  mounted() {
    console.log('父组件钩子');
  },
  methods:{
    childrenHook(str) {
      console.log(str);
    }
  }
};
</script>

<style scoped>
</style>