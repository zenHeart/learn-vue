<template functional>
  <p>
    {{ $options.finishList(props.list) }}
  </p>
</template>

<script>
  export default {
      funtional: true,
      props: {
        list: Array
      },
      finishList(arr) {
        return  arr.filter(el => el.finish)
      }
  }
</script>
