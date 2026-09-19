<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale, n } = useI18n()
const count = ref(1)
const name = ref('Vue')

const items = computed(() => Array.from({ length: count.value }, (_, i) => i + 1))

function toggle() {
  locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
}
</script>

<template>
  <div class="card">
    <div class="row">
      <button class="primary" @click="toggle">切换语言 (current: {{ locale }})</button>
      <button @click="count = Math.max(0, count - 1)">-</button>
      <span class="counter">{{ count }}</span>
      <button @click="count++">+</button>
    </div>

    <h2>{{ t('hello', { name }) }}</h2>
    <p>{{ t('cart', count, { named: { count } }) }}</p>
    <p>{{ t('saved', { n: count }) }}</p>

    <div class="items">
      <span v-for="i in items" :key="i" class="chip">#{{ i }}</span>
    </div>

    <p class="hint">
      数字格式化示例：<strong>{{ n(1234.5, 'currency', { currency: 'USD' }) }}</strong>
    </p>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 460px; }
.row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
button { padding: 5px 10px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; font-size: 0.85rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.counter { display: inline-block; min-width: 26px; text-align: center; font-weight: 600; }
h2 { font-size: 1.05rem; margin: 8px 0; }
.items { display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; }
.chip { background: #f6f8fa; border-radius: 999px; padding: 2px 8px; font-size: 0.78rem; color: #35495e; }
.hint { font-size: 0.82rem; color: #666; margin-top: 10px; }
</style>
