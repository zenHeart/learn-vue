<template functional>
  <div>
    <h3>由于没有实例，采用 props 访问传入数据</h3>
    <p>额外的数据可使用 data 访问,详见 <a href="https://vuejs.org/v2/guide/render-function.html#Functional-Components">函数组件</a>
    <strong>函数组件无生命周期钩子</strong>
    </p>
    <p v-bind="data.attrs"  v-on="data.on">{{ props.info }}</p>
    <p :style="data.style">{{ data }}</p>
  </div>
</template>

<script>
  export default {
    name:'FunComponent',
    props: {
      info: Object
    }
  }
</script>