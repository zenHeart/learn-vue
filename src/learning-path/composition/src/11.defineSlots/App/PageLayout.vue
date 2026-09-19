<template>
  <div class="layout">
    <section class="hdr">
      <slot name="header" />
    </section>
    <main>
      <slot />
    </main>
    <section class="ftr">
      <slot name="footer" :meta="{ len: footerMeta }" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const footerMeta = ref(5)

// 多个命名插槽的类型签名
defineSlots<{
  header(): any
  default(): any
  footer(props: { meta: { len: number } }): any
}>()
</script>

<style scoped>
.layout { border: 1px dashed #aaa; border-radius: 4px; overflow: hidden; background: #fff; }
.hdr { padding: 8px 12px; background: #fafafa; border-bottom: 1px solid #eee; }
main { padding: 12px; min-height: 60px; }
.ftr { padding: 8px 12px; background: #fafafa; border-top: 1px solid #eee; font-size: 12px; color: #666; }
</style>
