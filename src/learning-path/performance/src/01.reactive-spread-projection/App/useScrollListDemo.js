import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import {
  appendPage,
  countProjectionDeps,
  createListStore,
  FIELD_COUNT,
  INITIAL_PAGE_SIZE,
  ITEM_HEIGHT,
  LOAD_MORE_PAGE_SIZE,
  MAX_ITEMS,
  seedInitialPage,
} from './listProjectionModel.js'

export function useScrollListDemo(buildFn) {
  const store = reactive(createListStore())
  seedInitialPage(store)

  const list = computed(() => buildFn(store))

  const viewport = ref(null)
  const loading = ref(false)
  const hasMore = ref(true)
  const pageLoadMs = ref(null)
  const depCount = ref(null)
  const spinnerDeg = ref(0)
  const spinnerJank = ref(false)

  let rafId = 0
  let lastRaf = performance.now()

  function tickSpinner(now) {
    const delta = now - lastRaf
    lastRaf = now
    // 单帧 > 50ms 视为卡顿（长任务阻塞主线程）
    spinnerJank.value = delta > 50
    spinnerDeg.value = (spinnerDeg.value + Math.min(delta * 0.3, 12)) % 360
    rafId = requestAnimationFrame(tickSpinner)
  }

  onMounted(() => {
    rafId = requestAnimationFrame(tickSpinner)
  })

  onUnmounted(() => {
    cancelAnimationFrame(rafId)
  })

  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    pageLoadMs.value = null

    const start = performance.now()

    // 模拟分页 API 返回后 merge — 触发 orderedIds 变更 → 整表投影重算
    appendPage(store)
  void list.value // 同步等待 computed 重建（主线程阻塞发生在这里）

    await nextTick()
    pageLoadMs.value = performance.now() - start
    depCount.value = countProjectionDeps(buildFn, store)
    loading.value = false

    if (store.orderedIds.length >= MAX_ITEMS) {
      hasMore.value = false
    }
  }

  function onScroll() {
    const el = viewport.value
    if (!el || loading.value || !hasMore.value) return
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - ITEM_HEIGHT * 2
    if (nearBottom) loadMore()
  }

  async function scrollToBottom() {
    await nextTick()
    const el = viewport.value
    if (!el) return
    el.scrollTop = el.scrollHeight
    await nextTick()
    onScroll()
  }

  function reset() {
    seedInitialPage(store)
    hasMore.value = true
    pageLoadMs.value = null
    depCount.value = null
    nextTick(() => {
      if (viewport.value) viewport.value.scrollTop = 0
    })
  }

  function countDeps() {
    depCount.value = countProjectionDeps(buildFn, store)
  }

  return {
    store,
    list,
    viewport,
    loading,
    hasMore,
    pageLoadMs,
    depCount,
    spinnerDeg,
    spinnerJank,
    loadMore,
    onScroll,
    scrollToBottom,
    reset,
    countDeps,
    FIELD_COUNT,
    INITIAL_PAGE_SIZE,
    LOAD_MORE_PAGE_SIZE,
    ITEM_HEIGHT,
  }
}
