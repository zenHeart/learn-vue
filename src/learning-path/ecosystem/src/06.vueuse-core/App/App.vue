<script setup>
import { ref, onMounted, watch } from 'vue'
import { useLocalStorage, useDebounceFn, useEventListener, useIntersectionObserver } from '@vueuse/core'

const name = useLocalStorage('ecosystem-demo.name', 'guest')
const search = ref('')
const debouncedEcho = ref('')

const onSearch = useDebounceFn((q) => {
  debouncedEcho.value = `已触发请求: q=${q} @ ${new Date().toLocaleTimeString()}`
}, 300)

watch(search, (v) => onSearch(v))

// 监听 resize
const width = ref(0)
onMounted(() => {
  width.value = window.innerWidth
})
useEventListener(window, 'resize', () => {
  width.value = window.innerWidth
})

// IntersectionObserver
const sentinel = ref(null)
const visible = ref(false)
useIntersectionObserver(sentinel, ([entry]) => {
  visible.value = entry.isIntersecting
})
</script>

<template>
  <div class="card">
    <h2>VueUse Core 演示</h2>

    <label class="field">
      <span>姓名（自动持久化）</span>
      <input v-model="name" type="text" />
    </label>

    <label class="field">
      <span>搜索（防抖 300ms）</span>
      <input v-model="search" type="text" placeholder="试试连打几个字" />
    </label>
    <p class="hint">{{ debouncedEcho || '防抖结果会出现这里' }}</p>

    <div class="metric">
      <span class="label">window.innerWidth</span>
      <span class="val">{{ width }} px</span>
    </div>

    <div ref="sentinel" class="sentinel" :class="{ visible }">
      <span>{{ visible ? '看到了！' : '滚到这儿看我' }}</span>
    </div>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 460px; }
.card h2 { margin: 0 0 10px; font-size: 1.05rem; }
.field { display: block; margin-bottom: 10px; font-size: 0.85rem; }
.field span { display: block; color: #666; margin-bottom: 4px; }
.field input { width: 100%; padding: 6px 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; }
.hint { font-size: 0.78rem; color: #888; min-height: 1.2em; margin: -6px 0 8px; }
.metric { background: #f6f8fa; border-radius: 8px; padding: 8px 10px; margin: 8px 0; display: flex; gap: 8px; }
.metric .label { color: #888; font-size: 0.78rem; }
.metric .val { color: #42b883; font-weight: 600; }
.sentinel { height: 40px; background: #fafafa; border: 2px dashed #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; color: #999; margin-top: 12px; transition: all 0.2s; }
.sentinel.visible { background: #f0f9eb; border-color: #42b883; color: #18a058; }
</style>
