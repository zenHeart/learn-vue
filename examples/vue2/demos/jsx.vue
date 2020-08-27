<template>
  <div>
    <h3>验证 vue 使用 jsx</h3>
    <div>{{a}}</div>
    <Func/>
  </div>
</template>

<script>
  let Func = {
    fuctional: true,
    render() {
      return <div onClick={() => alert(1)}>{ JSON.stringify({a:1}) }</div>
    },
  }
  export default {
    meta: {
      tags: ['jsx']
    },
    components: {
      Func
    },
    data(){
      return {
        a: 1
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>