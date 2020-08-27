<template>
  <div>
    <h2>模拟函数组件计算属性的方法</h2>
    <h3>采用函数进行过滤</h3>
    <Func :list="list"></Func>
    <h3>采用 $options 函数进行过滤</h3>
    <FuncOption :list="list"></FuncOption>
  </div>
</template>

<script>
  import Func from './Func'
  import FuncOption from './FuncOption'
  export default {
    meta: {
      tags: ['函数组件']
    },
    components:{
      Func,
      FuncOption
    },
    data() {
      return {
        list: [
          {text: 'a',finish: false},
          {text: 'b',finish: true},
          {text: 'c',finish: false},
        ]
      }
    }
  }
</script>