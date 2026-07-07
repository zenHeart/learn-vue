<template>
  <div>
    <h2>采用 context.slots.default() 引用默认插槽 </h2>
    <C1>
      <template v-slot="...a">
        <h1>{{ a }}</h1>
      </template>
    </C1>
  </div>
</template>

<script>
import { h } from 'vue'

const C1 = (props, ctx) => h('button', [ctx.slots.default(1, 2, 3)])

export default {
  components: {
    C1
  }
}
</script>

<style>
button {
  margin: 10px;
  padding: 5px;
}
</style> 