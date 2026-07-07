<template>
  <div>
    <h3>验证函数组件 sfc 支持采用 template 模板</h3>
    <SimpleEditor @click="log" :style="{color: 'red'}" :info="{ a: 1}"/>
  </div>
</template>

<script>
  import SimpleEditor from './SimpleEditor.vue'
  export default {
    name:'UseCase',
    components:{
      SimpleEditor
    },
    meta: {
      tags: ['use-case']
    },
    methods:{
      log() {
        alert('log')
      }
    }
  }
</script>