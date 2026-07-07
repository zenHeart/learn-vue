<template>
  <div class="app">
    <nav>
      <button @click="goHome">HOME</button>
      <a
        v-for="item in sortNavs"
        :class="['nav-item', { active:(currentItem && currentItem.id ) === item.id }]"
        :key="item.name"
        :href="`#${item.name}`"
      >
        {{ item.name }}
        <Tags :tags="item.tags" :tagsColor="TAGS_COLOR"></Tags>
      </a>
    </nav>
    <div class="app-content">
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
import Tags from "./components/Tags.vue";
import { computed } from "vue";

export default {
  components: {
    Tags
  },
  data() {
    return {
      COMPONENTS,
      TAGS_COLOR,
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
      console.log(this.currentItem,'-----');
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
