<template>
  <div>
    <button @click="count++">add</button>
    <button @click="addObj">obj add</button>
    <slot :count="count" :obj="obj"></slot>
    <p>{{ $data }}</p>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        count: 0,
        obj: {
          count: 0
        }
      }
    },
    methods: {
      addObj() {
        this.obj = {
          count: ++this.obj.count
        }
      }
    }
  }
</script>