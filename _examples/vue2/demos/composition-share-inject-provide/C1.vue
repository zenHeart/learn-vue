<template>
  <div>
    <button @click="state.count++">add</button><span> {{ state }}</span>
  </div>
</template>

<script>
import { useState } from './business';
export default {
  setup() {
    return {
      state: useState()
    };
  }
};
</script>
