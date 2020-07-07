<template>
  <button @click="reset">复位</button>
</template>

<script>
  import {useBusiness} from './business.js'
  export default {
    setup() {
      let {reset}  = useBusiness()
      return {
        reset
      }
    }
  }
</script>

