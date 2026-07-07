<template>
  <button @click="add">自增</button>
</template>

<script>
  import { useState } from './business.js'
  export default {
    setup() {
      return {
        state: useState()
      }
    },
    methods:{
      add() {
        this.state.count++;
      }
    }
  }
</script>

