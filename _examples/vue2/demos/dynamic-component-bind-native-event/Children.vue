<template>
  <div>
    <button @click="increment">count: {{ count }}</button>
  </div>
</template>

<script>

  export default {
   data() {
    return {
      count: 0
    }
   },
   methods: {
    increment() {
      this.count++
    }
   },
  }
</script>

<style lang="scss" scoped>
</style>