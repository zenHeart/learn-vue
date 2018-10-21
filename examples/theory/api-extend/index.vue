<template>
<div>
    <h1>测试 extend 方法</h1>
    <button @click="trigger">触发模态框</button>
</div>
</template>

<script>
import "./modal.js";

export default {
  name: "Render",
  data: function() {
    return {
      modalFlag: true,
      message:''
    };
  },
  methods: {
    trigger() {
      this.modalFlag ^= 1;
      if (this.modalFlag) {
        this.$modal.show();
      } else {
        this.$modal.hide();
      }
    }
  }
};
</script>
