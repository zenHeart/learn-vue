<template>
  <div class="app">
    <nav>
      <div
        class="nav-item"
        @click="id = index"
        v-for="(item, index) in COMPONENTS"
        :key="item.name"
      >
        {{ item.name }}
        <Tags :tags="item.tags" :tagsColor="TAGS_COLOR"></Tags>
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
      id: 0
    };
  },
  computed: {
    isSFC() {
      return typeof this.COMPONENTS[this.id].component !== "string";
    }
  }
};
</script>

<style lang="stylus">
@import '../common/index.styl'
</style>
