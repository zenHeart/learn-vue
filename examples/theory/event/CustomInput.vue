<template>
        <p contenteditable @input="handleInput"></p>
</template>

<script>
export default {
  name: "CustomInput",
  props:{
      value:{
          type:String,
          default:'test'
      }
  },
  methods: {
    handleInput(event) {
        this.$emit('input',event.target.innerText);
    }
  }
};
</script>

<style scoped>
p {
  border: 1px solid #000;
}
</style>