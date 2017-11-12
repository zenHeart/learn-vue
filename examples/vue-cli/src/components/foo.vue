<template>
  <div class="hello">
    <h1>{{info}}</h1>
  </div>
</template>

<script>
export default {
  name: 'foo',
  data () {
    return {
      info: 'foo'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color:red;
  background-color: green;
}

</style>
