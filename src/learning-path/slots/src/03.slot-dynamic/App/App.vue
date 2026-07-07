<template>
  <div>
    <h2>利用 v-slot:[name] 实现插槽</h2>
    <button @click="changeSlot^=1">切换插槽内容</button>
    <C1>
      <template v-slot:[name]>
        <h2>{{name}}</h2>
      </template>
    </C1>
  </div>
</template>

<script>
import { h } from 'vue'

const C1 = {
  render() {
    return h('div', {}, [
      h('div', {}, [
        h('p', {}, '---default slot---'),
        this.$slots.default?.()
      ]),
      h('div', { style: { color: 'red' } }, [
        h('p', {}, '---fail slot----'),
        this.$slots.fail?.()
      ])
    ])
  }
}

export default {
  components: {
    C1
  },
  data() {
    return {
      changeSlot: false
    }
  },
  computed: {
    name() {
      return this.changeSlot ? 'default' : 'fail'
    }
  }
}
</script>

<style>
button {
  margin: 10px;
  padding: 5px 10px;
}
</style> 