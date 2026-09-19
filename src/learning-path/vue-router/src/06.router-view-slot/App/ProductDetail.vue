<template>
  <article class="card">
    <h3>商品 #{{ id }}</h3>
    <p>滚动列表保留测试：</p>
    <div ref="scrollBox" class="scroll">
      <p v-for="i in 30" :key="i">段落 {{ i }}</p>
    </div>
    <p class="hint">在 A 的滚动位置切到 B 再切回来，A 的滚动位置会保留。</p>
  </article>
</template>

<script setup>
import { computed, onActivated, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({ id: { type: String, required: true } })
const route = useRoute()
const scrollBox = ref(null)

// KeepAlive 激活 / 离开钩子，可在此恢复滚动位置
onActivated(() => {
  if (scrollBox.value) {
    scrollBox.value.scrollTop = scrollBox.value.dataset.scrollTop ?? 0
  }
})

watch(
  () => route.fullPath,
  () => {
    if (scrollBox.value) {
      scrollBox.value.dataset.scrollTop = scrollBox.value.scrollTop
    }
  },
)
</script>