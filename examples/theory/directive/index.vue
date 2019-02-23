<template>
  <div>
    <h1>测试指令</h1>
    <input type="text" v-model="text">
    <h1>测试是否换行</h1>

<p class="container">
      <span class="content" :class="{ellipse:showEllipse}" v-is-ellipse>{{text}}</span>
    <span   class="expand-icon" @click="showEllipse^=1">🐍</span>
</p>

  </div>
</template>

<script>
import "./limitLength";

export default {
  data: function() {
    return {
      text: "fsfdsfsffffffffflkddfsdfsdf",
      isEllipse: true,
      showEllipse: true
    };
  }
};
</script>

<style lang="css">
.container {
  position: relative;
}
.content {
  display: inline-block;
  width: 80%;
  overflow-wrap: break-word;
}
.ellipse {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.expand-icon {
  float:right
}

</style>
