<template>
  <div>
    <h2>setup 可以和 data 混合使用</h2>
    <P
      ><button @click="increment">自加数据</button> {{ test }}:
      {{ count }}
    </P>
  </div>
</template>

<script>
  import { setup,ref} from '@vue/composition-api'

  export default {
    data() {
      return {
        test:'测试数据'
      }
    },
    meta: {
      tags: ["composition"]
    },
    setup() {
      let count = ref(0);
      return {
        count,
        increment() {
          count.value++;
        }
    }
  },
    
  }
</script>

<style lang="scss" scoped>
</style>