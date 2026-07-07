<template>
  <div>
    <p>{{ state }}</p>
  </div>
</template>

<script>
  import { reactive,ref} from '@vue/composition-api'


  export default {
    props: {
      initCount: {
        type: Number,
        default: 1
      }
    },
    setup(props,context) {
      console.log(arguments)
      let state = reactive({
          count: props.initCount
      })
      return {
        state
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>