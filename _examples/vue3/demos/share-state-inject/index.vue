<template>
  <Example text="将 reactive 定义在外部实现共享">
    <p><C1 /><C2 /></p>
    <p>res: {{ state }}</p>
  </Example>
</template>

<script>
import { reactive, computed } from "vue";
import Example from "../../components/Example.vue";
import C1 from "./C1.vue";
import C2 from "./C2.vue";
import { provideState } from "./business.js";
export default {
  components: {
    Example,
    C1,
    C2
  },
  meta: {
    tags: ["composition", "state-share"]
  },
  setup() {
    return {
      state: provideState()
    };
  }
};
</script>
