<template>
  <div>
    <button @click="show^=1">load async</button>
    <div v-if="show">
      <Async></Async>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const Async = defineAsyncComponent(() => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res({
        template: `
          <div>
            <h1>异步组件</h1>
          </div>
        `,
        name: 'Async'
      })
    }, 5000)
  })
})

export default {
  components: {
    Async
  },
  data() {
    return {
      show: false
    }
  }
}
</script>

<style>
button {
  margin: 10px;
  padding: 5px;
}
</style> 