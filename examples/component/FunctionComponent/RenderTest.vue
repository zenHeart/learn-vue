<script>
export default {
  functional: true,
  name: "RenderTest",
  render: (h, context) => {
    return h("p", [
      "测试函数组件"
    ]);
  }
};
</script>

<style scoped>
</style>
