<template>
  <div>
    <h2>setup 可以和 data 混合使用</h2>
    <button @click="add">add</button>
    <p v-for="(item, index) in arrState.arr" :key="index">{{ item }}</p>
  </div>
</template>

<script>
  import { setup,ref,reactive} from '@vue/composition-api'

  function useArr() {
    const state = reactive({
      arr:[]
    })
    const add = () => {
      state.arr.push(1)
    }
    return {
      state,
      add
    }
  }


  export default {
    data() {
      return {
        test:'测试数据'
      }
    },
    meta: {
      tags: ["composition"]
    },
    setup() {
      let {state:arrState,add } = useArr()
      return {
        arrState,
        add,
    }
  },
  }
</script>

<style lang="scss" scoped>
</style>