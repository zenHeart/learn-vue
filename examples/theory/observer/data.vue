<template>
  <div>
    <button @click="ba">测试:{{a}}</button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      a: 1
    }
  },
  method: {
    ba () {
      console.log('test')
    }
  }
}
</script>

<style scoped>
</style>