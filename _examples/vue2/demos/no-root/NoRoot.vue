<template functional></template>
<script>
  export default  {
    name: 'NoRoot',
    props: {
      info: Object
    },
    render(h,ctx) {
      console.log('---' , ctx)
      let {props} = ctx;
      return props.info.extend ? [
        h('h3',JSON.stringify(props.info.basic)),
        h('h3',JSON.stringify(props.info.extendInfo)),
      ]: h('h3',JSON.stringify(props.info.basic));
    }
  }
</script>
