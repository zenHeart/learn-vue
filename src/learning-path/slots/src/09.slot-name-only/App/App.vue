<template>
  <div>
    <h2>可以只包含具名插槽</h2>
    <C1 @click="log('html 节点')">
      <template v-slot:a>
        <h1>test</h1>
      </template>
    </C1>
  </div>
</template>

<script>
export default {
  methods: {
    log: console.log
  },
  components: {
    C1: {
      template: `
        <button>
          <p>name slot</p>
          <slot name="a"></slot>
        </button>
      `
    }
  }
}
</script>

<style>
button {
  margin: 10px;
  padding: 5px;
}
</style> 