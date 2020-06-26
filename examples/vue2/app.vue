<template>
  <div class="app">
    <nav>
      <div class="sort-factor">
        <span>组织方式:</span>
        <select v-model="selected">
          <option v-for="option in options" v-bind:value="option.value">{{ option.text }}</option>
        </select>
      </div>
      <div class="nav-item" v-for="(value,key) in sortNavs" :key="value.name" @click="load(key)">
        <p>
          {{value.name}}
          <span v-if="value.tags">
            <span
              class="tag"
              v-for="(tag) in value.tags"
              :key="tag"
              :style="{
                background: TAGS_COLOR[tag]
              }"
            >{{tag}}</span>
          </span>
        </p>
      </div>
    </nav>
    <iframe id="raw" :srcdoc="content"></iframe>
  </div>
</template>

<script>
import { NAVS, TAGS_COLOR } from "./utils";
const SORT_FACTOR = {
  name: "示例名",
  tags: "标签"
};

export default {
  name: "app",
  data() {
    return {
      NAVS,
      TAGS_COLOR,
      content: "",
      selected: "name",
      options: Object.keys(SORT_FACTOR).map(key => ({
        text: SORT_FACTOR[key],
        value: key
      })),
    };
  },
  computed: {
    sortNavs() {
      let factor = this.selected;
      return this.NAVS.sort((a, b) => {
        if (a[factor] > b[factor]) {
          return 1;
        }
        if (a[factor] < b[factor]) {
          return -1;
        }
        return 0;
      });
    }
  },
  methods: {
    load(key) {
      this.content = NAVS[key].content;
    }
  }
};
</script>
<style lang="stylus">
@import './common.styl';
  
</style>