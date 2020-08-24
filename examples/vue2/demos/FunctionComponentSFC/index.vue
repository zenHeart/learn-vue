<template>
  <div>
    <h3>验证函数组件 sfc 支持采用 template 模板</h3>
    <FunComponent @click="log" :style="{color: 'red'}" :info="{ a: 1}"/>
  </div>
</template>

<script>
  import FunComponent from './FunC.vue'
  export default {
    name:'FuctionComponentSFC',
    components:{
      FunComponent
    },
    meta: {
      tags: ['函数组件', 'sfc']
    },
    methods:{
      log() {
        alert('log')
      }
    }
  }
</script>