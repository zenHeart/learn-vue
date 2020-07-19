<template>
  <div class="app">
    <nav>
      <button @click="goHome">HOME</button>
      <a
        :class="['nav-item', { active: currentItem.id === value.id }]"
        v-for="value in sortNavs"
        :key="value.name"
        :href="`#${value.name}`"
      >
        <Tags :tags="value.tags" :tagsColor="TAGS_COLOR"></Tags>
        <div>{{ value.name }}</div>
      </a>
    </nav>
    <div v-if="currentItem" class="app-content">
      <component v-if="isSFC" :is="currentItem.component"></component>
      <iframe
        frameBorder="0"
        width="100%"
        height="100%"
        v-else
        :srcdoc="currentItem.component"
      ></iframe>
    </div>
  </div>
</template>

<script>
import { COMPONENTS, TAGS_COLOR } from "./const";
import Tags from "../common/Tags";
export default {
  name: "app",
  components: {
    Tags
  },
  data() {
    return {
      COMPONENTS,
      TAGS_COLOR,
      updateTrigger: 1,
      componentName: location.hash.slice(1),
      tagName: new URLSearchParams(location.search).get("tag")
    };
  },
  methods: {
    goHome() {
      window.history.pushState({}, "", "/");
      window.history.pushState({}, "", "/"); // yes twice
      window.history.back();
    }
  },
  computed: {
    sortNavs() {
      if (this.tagName) {
        return this.COMPONENTS.filter(
          item => item.tags && item.tags.includes(this.tagName)
        );
      } else {
        return this.COMPONENTS;
      }
    },
    currentItem() {
      if (this.tagName) {
        if (this.componentName) {
          let item = this.sortNavs.filter(
            el => el.name === this.componentName
          )[0];
          if (item) {
            return item;
          } else {
            // 删除 相关 hash
            return this.sortNavs[0];
          }
        } else {
          return this.sortNavs[0];
        }
      } else {
        if (this.componentName) {
          return COMPONENTS.filter(el => el.name === this.componentName)[0];
        } else {
          return this.sortNavs[0];
        }
      }
    },
    isSFC() {
      return this.currentItem && typeof this.currentItem.component !== "string";
    }
  },
  created() {
    window.addEventListener("popstate", () => {
      this.componentName = location.hash.slice(1);
      this.tagName = new URLSearchParams(location.search).get("tag");
      console.log("chage", this.componentName, this.tagName);
    });
  }
};
</script>
<style lang="stylus">
@import '../common/index.styl'
</style>