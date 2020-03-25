<template>
  <Example text="watchEffect 入参支持传入校验回调">
    <h2>注意校验在刷新是才触发,并且提前与执行内容</h2>
    <button @click="count++">点击增加计数 count {{ count }}</button>
    <button @click="count1++">点击增加计数 count1 {{ count1 }}</button>
  </Example>
</template>

<script>
// TODO: 单文件中不支持申明新的组件
import Example from '../components/Example.vue';

import { ref, watchEffect } from 'vue';

const count = ref(0);
const count1 = ref(0);

let stopWhenEvenNum = false;
watchEffect(onInvalidate => {
  stopWhenEvenNum || console.log('log count:', count.value);
  onInvalidate(() => {
    stopWhenEvenNum = !(count.value % 2);
    console.log('%c 检验函数在属性更新后触发');
    console.log(
      `valid count is even count: ${stopWhenEvenNum ? 'even' : 'odd'}`
    );
  });
});

export default {
  components: {
    Example
  },
  setup() {
    return {
      count,
      count1
    };
  }
};
</script>

<style lang="scss" scoped></style>
