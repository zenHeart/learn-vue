<template>
  <div>
    <h2>setup 中接受 props 和 context 的值</h2>
    <Children></Children>
    <Children :initCount="4"></Children>
  </div>
</template>

<script>
import Children from './Children'

  export default {
    meta: {
      tags: ["composition", "setup"]
    },
    components:{Children},
    data() {
      return {
        test:'测试数据'
      }
    },
  }
</script>
