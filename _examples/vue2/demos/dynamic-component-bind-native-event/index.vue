<template>
  <div>
    <h2>.native 绑定原生事件</h2>
    <component ref="children" @click.native="log" is="Children"></component>
  </div>
</template>

<script>
import Children from './Children'

  export default {
    meta: {
      tags: ["component", "dynamic"]
    },
    components:{Children},
    data() {
      return {
        test:'测试数据'
      }
    },
    methods: {
      log(e) {
        console.dir(this.$refs.children)
      }
    },
  }
</script>
