<template>
  <div>
    <h2>采用 context.slots.default() 引用默认插槽 </h2>
    <C1>
      <h1>test</h1>
    </C1>
  </div>
</template>

<script>
import { h } from 'vue'

const C1 = (props, ctx) => h('button', [ctx.slots.default()])

export default {
  components: {
    C1
  }
}
</script>

<style>
button {
  margin: 10px;
  padding: 5px 10px;
}
</style> 