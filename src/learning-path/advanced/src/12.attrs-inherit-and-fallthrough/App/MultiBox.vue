<template>
  <div class="mb">
    <header v-bind="attrs">header 接收 attrs</header>
    <main>main 节点</main>
    <footer :data-info="attrs['data-info']">footer 节点</footer>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
</script>

<style scoped>
.mb { padding: 8px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
header { padding: 6px 10px; background: #fafafa; border-bottom: 1px solid #eee; }
main { padding: 8px 10px; }
footer { padding: 6px 10px; background: #fafafa; border-top: 1px solid #eee; font-size: 12px; color: #555; }
</style>
