<template>
  <div>
    <h3>验证函数组件在 SFC 文件中的注入，由于不存在 this 环境只需在，父元素统一注册即可使用</h3>
    <Func2></Func2>
  </div>
</template>
<script>
  import Func2 from './Func2'
  import Func1 from './Func1'
  export default {
    meta: {
      tags: [
        '函数组件'
      ]
    },
    components:{
      Func2,
      Func1
    }
  }
</script>