<template>
  <Example text="setup 在 beforeCreate 钩子之前触发"> </Example>
</template>

<script>
import Example from '../components/Example.vue';

export default {
  components: {
    Example
  },
  setup() {
    console.group('setup hooks');
    console.log(
      '%c 在 beforeCreate 之前触发.%c所以不要访问 dom!',
      'font-size:1.2rem;',
      'color:red'
    );
  },
  beforeCreate() {
    console.log('%c----beforeCreate hooks------', 'color:green');
    console.groupEnd();
  },
  data() {
    return {
      a: 1
    };
  },
  methods: {
    inverse() {
      this.a ^= 1;
    }
  }
};
</script>

<style lang="scss" scoped></style>
