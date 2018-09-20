
<template>
    <div>
        <h1>组件属性传入函数作为参数</h1>
        <p1>
            默认值:{{name}}<br/>
            传递函数作为属性产生的结果:{{hiName}}<br/>
        </p1>
    </div>
</template>

<script>
export default {
  data() {
      return {
          name:'tom'
      }
  },  
  props: {
    hi:{
        default:null,
    }
  },
  computed:{
      hiName() {
          return this.hi(this.name);
      }
  }
};
</script>

<style scoped>
</style>