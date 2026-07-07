<template>
  <div class="tags-wrap" v-if="tags">
    <a
      class="tag"
      v-for="tag in tags"
      @click.stop="jump(tag)"
      :key="tag"
      :style="{
        background: tagsColor[tag]
      }"
      >{{ tag }}</a
    >
  </div>
</template>

<script>
export default {
  name: "Tags",
  props: {
    tagsColor: [Array, Object],
    tags: Array
  },
  methods: {
    jump(tag) {
      let queryParams = new URLSearchParams(location.search);
      queryParams.set("tag", tag);
      history.pushState(null, null, "?" + queryParams.toString());
      this.$emit("update");
    }
  }
};
</script>

<style lang="stylus" scoped>
.tags-wrap
  line-height 0

  .tag
    display inline-block
    font-size 14px
    height 18px
    line-height 18px
    border-radius 3px
    padding 0 6px
    color black
    vertical-align top
    margin-right 5px
</style>