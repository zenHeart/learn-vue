<template>
  <div>
    <button @click="show^=1">load async</button>
    <div v-if="show">
      <Async></Async>
    </div>
  </div>
</template>

<script>
  import { defineAsyncComponent }  from 'vue'
  
  export default {
    meta: {
      tags: [ 'defineAsyncComponent' ]
    },
    components: {
      Async: defineAsyncComponent(() => {
        return new Promise((res,rej) => {
          setTimeout(() => {
            res(import('./Async.vue'))
          },5000)
        })
      })
    },
    data() {
      return {
        show: false
      }
    }
  }
</script>