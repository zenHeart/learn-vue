<template>
  <div>
    <h2>Object.assign 重置 state 状态</h2>
    <P>
      <button @click="set">增加数据</button>
      <button @click="reset">重置</button>
    </P>
    <p>结果: {{ state }}</p>
  </div>
</template>

<script>
  import { setup,ref, reactive} from '@vue/composition-api'

  export default {
    data() {
      return {
        test:'测试数据'
      }
    },
    meta: {
      tags: ["composition","reactive"]
    },
    setup() {
      const INIT = {
        count: 0,
        date: new Date(),
      }
      let state = reactive({...INIT})
      return {
        state,
        set() {
          state.count++;
          state.date = new Date()
        },
        reset() {
           Object.assign(state, INIT);
        }
    }
  },
    
  }
</script>

<style lang="scss" scoped>
</style>