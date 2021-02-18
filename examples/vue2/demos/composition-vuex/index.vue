<template>
  <div>
      <button @click="store.mutation.add">add</button>
      <p>{{ store }}</p>
  </div>
</template>

<script>
import { setupStore } from './store'
import { useSotre } from './business.js'


  export default {
    meta: {
      tags: ["composition", "composition-vuex"]
    },
    beforeCreate() {
      setupStore();
    },
    setup() {
      return {
        ... useSotre()
      }
    }
  }
</script>
