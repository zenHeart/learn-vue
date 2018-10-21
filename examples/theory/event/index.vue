<template>
    <div>
        <CustomEvent @custom="showCustom"></CustomEvent>
        <CustomInput v-model="test"></CustomInput>
        <p>{{test}}</p>

    </div>
</template>

<script>
import CustomEvent from "./CustomEvent.vue";
import CustomInput from "./CustomInput.vue";
export default {
  data: function() {
    return {
      test: ''
    };
  },
  components: {
    CustomEvent,
    CustomInput
  },
  methods: {
    showCustom() {
      console.log("自定义事件输出:", arguments);
    }
  }
};
</script>

<style scoped>
</style>