<template>
  <span v-if="tags">
    <span
      class="tag"
      v-for="tag in tags"
      :key="tag"
      :style="{
        background: tagsColor[tag]
      }"
      >{{ tag }}</span
    >
  </span>
</template>

<script>
export default {
  name: "Tags",
  props: {
    tagsColor: [Array, Object],
    tags: Array
  }
};
</script>

<style lang="stylus" scoped>
.tag
  display inline-block
  font-size 14px
  height 18px
  line-height 18px
  border-radius 3px
  padding 0 6px
  color black
  vertical-align top
</style>