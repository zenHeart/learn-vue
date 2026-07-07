<template>
  <div>
    <h2>移除 $scopedSlots 统一使用 $slots 访问</h2>
    <C1>
      <h1>test</h1>
    </C1>
  </div>
</template>

<script>
import { h } from 'vue'

const C1 = {
  render() {
    console.log('slots', this.$slots)
    return h('div', [this.$slots.default()])
  }
}

export default {
  components: {
    C1
  }
}
</script>

<style>
div {
  margin: 10px;
  padding: 5px;
}
</style> 