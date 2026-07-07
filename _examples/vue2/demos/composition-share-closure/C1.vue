<template>
  <div>
    <button @click="add">add</button><span> {{ state }}</span>
  </div>
</template>

<script>
import { useCount } from './business';
export default {
  setup() {
    return {
      ...useCount()
    };
  }
};
</script>
