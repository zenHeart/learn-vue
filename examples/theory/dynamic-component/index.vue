<template>
    <div>
        <h1>测试动态组件</h1>
        <p>
            <button @click="componentId='Children1'">children1</button>
            <button  @click="componentId='Children2'">children2</button>
            <button  @click="componentId='Children3'">children3</button>
        </p>
        <component :is="componentId"></component>
    </div>
</template>

<script>
import Children1 from "./Children1.vue";
import Children2 from "./Children2.vue";
import Children3 from "./Children3.vue";

export default {
  name: "DynamicComponent",
  data: function() {
    return {
      componentId: ""
    };
  },
  components: {
    Children1,
    Children2,
    Children3
  }
};
</script>

<style scoped>
</style>