<template>
  <div>
    <h2>{{ text }}</h2>
    <div>
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
