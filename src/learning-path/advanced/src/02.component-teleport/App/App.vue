<template>
  <div>
    <h2>teleport 组件必须在挂载点之后感觉是 bug</h2>
    <div>content</div>
    <div id="footer"></div>
    <teleport to="#footer">
      <div>
        footer
      </div>
    </teleport>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: 'hello vue'
    }
  }
}
</script>

<style>
div {
  margin: 10px;
  padding: 5px;
}
#footer {
  border: 1px solid #ccc;
  padding: 10px;
}
</style> 