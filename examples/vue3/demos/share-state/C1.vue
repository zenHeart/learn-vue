<template>
  <button @click="add">自增</button>
</template>

<script>
  import { useBusiness } from './business.js'
  export default {
    setup() {
      let {add}  = useBusiness()
      return {
        add
      }
    }
  }
</script>

