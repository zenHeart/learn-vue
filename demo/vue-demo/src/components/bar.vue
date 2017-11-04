<template>
  <div class="hello">
    <h1>测试文件</h1>
    <h1>{{info}}</h1>
    <h1>{{demo}}</h1>
  </div>
</template>

<script>
  export default {
    name: 'bar',
    data () {
      return {
        info: 'bar',
        demo:'haah'
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1 {
    color:green;
    background-color: red;
  }

</style>
