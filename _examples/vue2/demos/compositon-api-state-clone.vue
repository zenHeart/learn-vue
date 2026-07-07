<template>
  <div>
    <h1>通过将状态包裹实现多份逻辑复用</h1>
    <button :class="{active: tab === 1}" @click="tab = 1">TAB1</button><button :class="{active: tab === 2}" @click="tab=2">TAB2</button></p>
    <p>{{currentTab.state}}</p>
  </div>
</template>
<style lang="stylus" scoped>
div
  &>button
    margin-right 10px

    &.active
      border 1px solid blue
</style>

<script>
import Mock from "mockjs";
import { computed, ref, onBeforeMount } from "@vue/composition-api";

const useTableState = options => {
  const state = ref(null);
  const get = () => {
    const mockData = Mock.mock({
      options,
      "list|1-5": [
        {
          title: "@sentence(5,15)",
          content: "@sentence(20,50)"
        }
      ]
    });
    return fetch("https://httpbin.org/post", {
      body: JSON.stringify(mockData),
      method: "POST"
    })
      .then(r => r.json())
      .then(res => {
        state.value = JSON.parse(res.data);
      });
  };
  return {
    state,
    get
  };
};
export default {
  meta: {
    tags: ["composition"]
  },
  setup() {
    let tabs = {
      1: useTableState({ tab: 1 }),
      2: useTableState({ tab: 2 })
    };
    let tab = ref(1);
    let currentTab = computed(() => tabs[tab.value]);
    onBeforeMount(() => {
      Object.keys(tabs).forEach(key => {
        tabs[key].get();
      });
    });
    return {
      tab,
      ...tabs,
      currentTab
    };
  }
};
</script>