<template>
  <div class="child">子组件看到: {{ msg }}</div>
</template>

<script>
// 用普通 script 演示 mutate prop：因为 <script setup> 中 props 是只读 proxy，
// 通过 this 才能直接绕过；这是 Vue 的反模式，正好用来触发 warnHandler。
export default {
  props: ['msg'],
  methods: {
    mutateProp() {
      // 触发 "Set operation on key ... failed: target is readonly" 警告
      ;(this as any).msg = 'mutated by parent'
    },
  },
}
</script>

<style scoped>
.child {
  display: inline-block;
  padding: 6px 12px;
  margin: 4px 0;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 4px;
}
</style>