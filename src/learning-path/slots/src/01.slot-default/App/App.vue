<template>
  <div>
    <h2>验证 slot 节点的默认值</h2>
    <C1 @click="log('default')"></C1>
    <C1 @click="log('空格不认为包含内容')"> </C1>
    <C1 @click="log('html 节点')">
      <h1>test</h1>
    </C1>
  </div>
</template>

<script>
import { h } from 'vue';

const C1 = {
  render() {
    return h('button', {
      onClick: this.$attrs.onClick
    }, [
      this.$slots.default ? this.$slots.default() : h('h3', 'default')
    ]);
  }
};

export default {
  components: {
    C1
  },
  methods: {
    log: console.log
  }
};
</script>

<style scoped>
button {
  margin: 10px;
  padding: 5px 10px;
}
</style> 