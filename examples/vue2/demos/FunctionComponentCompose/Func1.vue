<template functional>
  <div>
      <p>{{props.a}}</p>
  </div>
</template>

<script>
  export default {
    name: 'Func1',
    props: {
      a: String
    }
  }
</script>
