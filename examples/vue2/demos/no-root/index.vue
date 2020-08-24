<template>
  <div>
    <h3>sfc 无根元素函数组件不支持</h3>
    <div>
      <h4>sfc 文件中不支持</h4>
      <NoRoot :info="{
          basic:1,
          extend: true,
          extendInfo:'extend'
        }"></NoRoot>
        <NoRoot :info="{
          basic:1,
          extendInfo:'extend'
        }"></NoRoot>
    </div>
    <div>
      <h4>js 文件中支持</h4>
      <NoRoot1 :info="{
          basic:1,
          extend: true,
          extendInfo:'extend'
        }"></NoRoot1>
        <NoRoot1 :info="{
          basic:1,
          extendInfo:'extend'
        }"></NoRoot1>
    </div>

  </div>
</template>

<script>
  import NoRoot from './NoRoot.vue'
  import NoRoot1 from './NoRoot.js'
  export default {
    components:{
      NoRoot,
      NoRoot1
    },
    meta: {
      tags: ['函数组件','no-root']
    }
  }
</script>
