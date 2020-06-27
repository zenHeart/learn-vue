<template>
  <div class="app">
    <nav>
      <div class="sort-factor">
        <span>组织方式:</span>
        <select v-model="selected">
          <option v-for="option in options" v-bind:value="option.value">{{
            option.text
          }}</option>
        </select>
      </div>
      <div
        class="nav-item"
        v-for="(value, key) in sortNavs"
        :key="value.name"
        @click="id = key"
      >
        <p>
          {{ value.name }}
          <Tags :tags="value.tags" :tagsColor="TAGS_COLOR"></Tags>
        </p>
      </div>
    </nav>
    <div class="app-content">
      <component v-if="isSFC" :is="COMPONENTS[id].component"></component>
      <iframe
        frameBorder="0"
        width="100%"
        height="100%"
        v-else
        :srcdoc="COMPONENTS[id].component"
      ></iframe>
    </div>
  </div>
</template>

<script>
import { COMPONENTS, TAGS_COLOR } from "./const";
import Tags from "../common/Tags";
const SORT_FACTOR = {
  name: "示例名",
  tags: "标签"
};

export default {
  name: "app",
  components: {
    Tags
  },
  data() {
    return {
      COMPONENTS,
      TAGS_COLOR,
      id: 0,
      selected: "name",
      options: Object.keys(SORT_FACTOR).map(key => ({
        text: SORT_FACTOR[key],
        value: key
      }))
    };
  },
  computed: {
    sortNavs() {
      let factor = this.selected;
      return this.COMPONENTS.sort((a, b) => {
        if (a[factor] > b[factor]) {
          return 1;
        }
        if (a[factor] < b[factor]) {
          return -1;
        }
        return 0;
      });
    },
    isSFC() {
      return typeof this.COMPONENTS[this.id].component !== "string";
    }
  }
};
</script>
<style lang="stylus">
@import '../common/index.styl'
</style>