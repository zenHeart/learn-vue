<template>
  <div class="demo">
    <h2>ComponentCustomProperties · 类型增强</h2>
    <p class="hint">
      演示如何通过 <code>declare module 'vue'</code> 把全局属性注册到 TS 类型系统中。
      所有 <code>$xxx</code> 在模板与 Options API 中都会获得类型提示。
    </p>

    <section class="card">
      <h3>① $api 全局方法（模板调用）</h3>
      <p>当前时间戳: <strong>{{ now }}</strong></p>
      <p>$api.listPosts() 数量: <strong>{{ postCount }}</strong></p>
      <p class="hint">这些方法都不需要 import，是通过 <code>app.config.globalProperties</code> 注入的</p>
    </section>

    <section class="card">
      <h3>② $filters 格式化（模板调用）</h3>
      <p>日期: {{ formattedDate }}</p>
      <p>金额: {{ formattedMoney }}</p>
    </section>

    <section class="card">
      <h3>③ $track 事件埋点</h3>
      <button @click="track('button-click', { position: 'card-3' })">
        点击埋点
      </button>
      <p class="hint">已记录埋点事件数: {{ trackCount }}</p>
    </section>

    <section class="card">
      <h3>④ Composition API 下的访问方式</h3>
      <pre class="code"><code>// setup() 没有 this，需要通过 getCurrentInstance()
const { appContext } = getCurrentInstance()!
const $api = appContext.config.globalProperties.$api</code></pre>
      <p class="hint">Composition API 推荐做法是写一个 <code>useApi()</code> composable，避免直接碰 getCurrentInstance</p>
    </section>

    <section class="card">
      <h3>⑤ ComponentCustomOptions / ComponentCustomProps</h3>
      <p class="hint">
        自定义组件选项（如 <code>beforeRouteEnter</code>）与所有组件的 <code>t</code> prop
        也通过 declare module 扩展，详见 <code>App/globals.d.ts</code>。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'

// 这里不显式声明类型，让 TS 从 globals.d.ts 推断
const now = ref(new Date().toISOString())
const postCount = ref(0)
const trackCount = ref(0)
const trackLog = ref<string[]>([])

const formattedDate = computed(() => {
  // 通过全局 $filters.formatDate 调用
  // 类型提示来自 ComponentCustomProperties
  const inst = getCurrentInstance()
  const $filters = inst?.appContext.config.globalProperties.$filters
  return $filters ? $filters.formatDate(new Date()) : ''
})

const formattedMoney = computed(() => {
  const inst = getCurrentInstance()
  const $filters = inst?.appContext.config.globalProperties.$filters
  return $filters ? $filters.formatCurrency(1234.56) : ''
})

// 演示 track 函数（实际类型来自 ComponentCustomProperties.$track）
function track(event: string, payload?: Record<string, unknown>) {
  trackLog.value.push(`${event} ${payload ? JSON.stringify(payload) : ''}`)
  trackCount.value++
  // TS 能识别 $track 是函数
  const inst = getCurrentInstance()
  inst?.appContext.config.globalProperties.$track?.(event, payload)
}

onMounted(async () => {
  // 调用 $api
  const inst = getCurrentInstance()
  const $api = inst?.appContext.config.globalProperties.$api
  if ($api) {
    const posts = await $api.listPosts()
    postCount.value = posts.length
  }
})
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0; font-size: 12px; color: #666; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.code { background: #1e1e1e; color: #d4d4d4; padding: 8px; border-radius: 4px; font-size: 11px; overflow-x: auto; }
button { padding: 6px 14px; background: #42b883; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
</style>