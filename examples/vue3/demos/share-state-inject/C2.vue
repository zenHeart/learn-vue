<template>
  <button @click="reset">复位</button>
</template>

<script>
import { useState } from "./business.js";
export default {
  setup() {
    return {
      state: useState()
    };
  },
  methods: {
    reset() {
      this.state.count =  0;
    }
  }
};
</script>

