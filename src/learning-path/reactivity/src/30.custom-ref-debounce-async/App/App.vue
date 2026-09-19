<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 防抖 ref：键入 300ms 后才更新</h4>
      <input v-model="debouncedText" placeholder="快速键入观察防抖" />
      <p>同步显示: <code>{{ rawText }}</code></p>
      <p>防抖值（300ms 后才更新）: <strong>{{ debouncedText }}</strong></p>
      <p>触发次数: <code>{{ debouncedTriggerCount }}</code></p>
    </section>

    <section class="card">
      <h4>② 节流 ref：200ms 内最多触发 1 次</h4>
      <input v-model="throttledText" placeholder="快速键入观察节流" />
      <p>节流触发次数: <code>{{ throttleTriggerCount }}</code></p>
      <p class="hint">连续键入但 trigger 只在 200ms 间隔发生</p>
    </section>

    <section class="card">
      <h4>③ 异步 ref：首次读取时加载</h4>
      <p>异步值: <strong>{{ asyncValue }}</strong></p>
      <p class="hint">打开 Console 看 effect 触发时机</p>
    </section>

    <section class="card">
      <h4>④ 不调 track / 不调 trigger 的对比</h4>
      <input v-model="noTrackText" placeholder="不会触发响应式" />
      <p>外部渲染值: <code>{{ noTrackValue }}</code></p>
      <p class="hint">自定义 ref 不调 track → 模板不更新；用 watch 才会触发</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { customRef, ref, watch, watchEffect } from 'vue'

const title = ref('customRef 实战：debounce / throttle / async')

/* === ① 防抖 === */
const rawText = ref('')
const debouncedTriggerCount = ref(0)

function useDebouncedRef<T>(initial: T, delay = 300) {
  let value = initial
  let timer: ReturnType<typeof setTimeout> | null = null
  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: T) {
      rawText.value = String(newValue)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        value = newValue
        debouncedTriggerCount.value++
        trigger()
      }, delay)
    },
  }))
}

const debouncedText = useDebouncedRef<string>('', 300)

/* === ② 节流 === */
const throttleTriggerCount = ref(0)

function useThrottledRef<T>(initial: T, interval = 200) {
  let value = initial
  let lastTrigger = 0
  let pendingTimer: ReturnType<typeof setTimeout> | null = null
  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: T) {
      value = newValue
      const now = Date.now()
      const elapsed = now - lastTrigger
      if (elapsed >= interval) {
        lastTrigger = now
        throttleTriggerCount.value++
        trigger()
      } else if (!pendingTimer) {
        pendingTimer = setTimeout(() => {
          pendingTimer = null
          lastTrigger = Date.now()
          throttleTriggerCount.value++
          trigger()
        }, interval - elapsed)
      }
    },
  }))
}

const throttledText = useThrottledRef<string>('', 200)

/* === ③ 异步 ref === */
const asyncValue = ref<string>('（未加载）')

function useAsyncRef<T>(loader: () => Promise<T>) {
  let value: T | undefined
  let loaded = false
  return customRef<T | undefined>((track, trigger) => ({
    get() {
      track()
      if (!loaded) {
        loaded = true
        loader().then((v) => {
          value = v
          asyncValue.value = String(v)
          trigger()
        })
      }
      return value
    },
    set() { /* read-only */ },
  }))
}

const asyncRef = useAsyncRef<string>(
  () => new Promise((r) => setTimeout(() => r('异步加载完成 ✨'), 800)),
)

watchEffect(() => {
  // 访问 asyncRef 让 effect 订阅
  void asyncRef.value
})

/* === ④ 不调 track === */
const noTrackText = ref('')
const noTrackValue = ref('')
function useNoTrackRef<T>(initial: T) {
  let value = initial
  return customRef<T>((track, trigger) => ({
    get() {
      // 注意：没有 track()
      return value
    },
    set(newValue: T) {
      noTrackText.value = String(newValue)
      value = newValue
      trigger()
    },
  }))
}

const noTrackRef = useNoTrackRef<string>('')
// 用 watch 才能订阅（track 漏掉了，但 watch 会主动订阅）
watch(noTrackRef, (v) => {
  noTrackValue.value = v
})
</script>

<style scoped>
.demo {
  max-width: 820px;
  margin: 16px auto;
  padding: 16px;
  color: #213547;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.card {
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e293b;
}
.hint {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}
input {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  width: 60%;
  margin-bottom: 6px;
}
code {
  font-family: 'SFMono-Regular', Consolas, monospace;
  background: #fef9c3;
  padding: 1px 4px;
  border-radius: 3px;
}
</style>
