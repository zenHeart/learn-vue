<template>
  <header v-bind="rootAttrs" @click="onClick">多 root 组件 header</header>
  <section>多 root 组件 section（不继承 attrs）</section>
</template>

<script setup>
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const rootAttrs = attrs
function onClick() {
  // 触发父组件的 @custom
  attrs.onCustom?.()
}
</script>

<style scoped>
header { background: #dbeafe; padding: 6px; border-radius: 4px; }
section { padding: 6px; }
</style>
