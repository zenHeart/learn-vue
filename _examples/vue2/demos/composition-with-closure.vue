<template>
  <div>
    <h2>非响应式变量使用闭包处理不对外暴露</h2>
    <P><button @click="increment">自加数据</button> {{ state.count }} </P>
    <P><button @click="showLog">打印日志</button> </P>
    <P><button @click="clearLog">清空日志</button> </P>
  </div>
</template>

<script>
  import { reactive, setup,ref} from '@vue/composition-api'

  function usePage() {
    let innerLog = [];
    const state = reactive({
      count: 0
    });
    function increment() {
      state.count++;
      innerLog.push(`${new Date().toISOString()}:${state.count}`)
    }
    function showLog() {
      console.log(innerLog)
    }
    function clearLog() {
      innerLog = []
    }
    return {
      state,
      increment,
      showLog,
      clearLog
    }
  }


  export default {
    meta: {
      tags: ["composition"]
    },
    setup() {
      return {
        ...usePage()
      }
    },
  }
</script>