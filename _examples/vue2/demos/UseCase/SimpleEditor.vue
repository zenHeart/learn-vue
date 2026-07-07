<template functional>
  <input
    @blur="log"
   v-bind="value"
   />
</template>

<script>
  export default {
    name:'FunComponent',
    props: {
      info: Object
    },
    data() {
      return {
        value: ''
      }
    },

  }
</script>