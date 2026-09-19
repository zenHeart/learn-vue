<template>
  <div class="rp">
    <div>title: <strong>{{ title }}</strong></div>
    <div>score: <strong>{{ score }}</strong></div>
    <div>extra (默认 ['extra']): <strong>{{ extra.join(' | ') }}</strong></div>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    score: { type: Number, default: 0 },
    extra: {
      type: Array,
      // 引用类型默认值必须用工厂函数，避免共享
      default: () => ['extra']
    }
  }
}
</script>

<style scoped>
.rp { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; font-size: 13px; }
.rp > div { padding: 2px 0; }
</style>
