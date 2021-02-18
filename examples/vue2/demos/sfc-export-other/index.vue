<template>
  <div>
    <h1>测试组件可以引入非 default 内容</h1>
    <button @click="handleClick">showModal</button>
  </div>
</template>

<script>
  import { showModal }  from './B'
  console.log('-----', showModal)
  export default {
   meta: {
      tags: ["sfc"]
    },
    methods: {
      handleClick() {
        showModal()
      }
    }
  }
</script>