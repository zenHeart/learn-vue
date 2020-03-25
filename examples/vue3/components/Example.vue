<template>
  <div>
    <h2>{{ text }}</h2>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    text: String
  }
};
</script>

<style lang="scss" scoped></style>
