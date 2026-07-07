<template>
  <div>
    <h2>使用 $slots.soltName() 访问具名插槽</h2>
    <C1>
      <template #header>header</template>
      <h2>content</h2>
      <template #footer>footer</template>
    </C1>
  </div>
</template>

<script>
import { h } from 'vue'

const C1 = {
  render() {
    console.log('slots', this.$slots)
    const header = this.$slots.header()
    const content = this.$slots.default()
    const footer = this.$slots.footer()
    return h('div', [header, content, footer])
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