<template>
  <div>
    <h1>验证 composition api 返回对象中包含计算属性会导致转换为 value，版本问题 1.0.0 无此现象</h1>
    <p><button @click="a.add">add</button> {{ a.state }} {{ a.double }}</p>
  </div>
</template>


<script>
import { computed, reactive } from "@vue/composition-api";

const useState = () => {
  debugger
  const state = reactive({
    count: 1
  });
  const add = () => state.count++;
  const double = computed(() => state.count * 2);
  return {
    state,
    double,
    add
  };
};
export default {
  setup() {
    let a = useState();
    return {
      a
    };
  },
  meta: {
    tags: ["composition"]
  }
};
</script>