<script setup>
import { buildProjectionBad } from './listProjectionModel.js'
import { useScrollListDemo } from './useScrollListDemo.js'

const {
  list,
  viewport,
  loading,
  hasMore,
  pageLoadMs,
  depCount,
  onScroll,
  scrollToBottom,
  reset,
  countDeps,
  FIELD_COUNT,
  INITIAL_PAGE_SIZE,
  LOAD_MORE_PAGE_SIZE,
  ITEM_HEIGHT,
} = useScrollListDemo(buildProjectionBad)
</script>

<template>
  <div class="demo">
    <p class="badge bad">① 问题代码 — spread reactive</p>

    <p class="meta">
      首屏 <strong>{{ INITIAL_PAGE_SIZE }}</strong> 条，每页 +<strong>{{ LOAD_MORE_PAGE_SIZE }}</strong>，
      每条 <strong>{{ FIELD_COUNT }}</strong> 字段
    </p>

    <div class="metrics">
      <div class="metric">
        <span class="label">当前列表</span>
        <span class="value">{{ list.length }} 条</span>
      </div>
      <div class="metric">
        <span class="label">上次分页加载</span>
        <span class="value" :class="{ warn: pageLoadMs != null && pageLoadMs >= 100 }">
          {{ pageLoadMs != null ? `${pageLoadMs.toFixed(0)} ms` : '滚到底试试' }}
        </span>
      </div>
      <div class="metric">
        <span class="label">computed 依赖数</span>
        <span class="value" :class="{ warn: depCount != null && depCount > list.length * 8 }">
          {{ depCount ?? '—' }}
        </span>
      </div>
    </div>

    <div class="actions">
      <button class="primary" @click="scrollToBottom">滚到底加载下一页</button>
      <button @click="countDeps">统计依赖</button>
      <button @click="reset">重置</button>
    </div>

    <div
      ref="viewport"
      class="viewport"
      :style="{ height: `${ITEM_HEIGHT * 7}px` }"
      @scroll="onScroll"
    >
      <div
        v-for="row in list"
        :key="row.id"
        class="row"
        :style="{ height: `${ITEM_HEIGHT}px` }"
      >
        <span class="title">{{ row.title }}</span>
        <span class="members">{{ row.userList?.length ?? 0 }} 人</span>
      </div>
      <div v-if="loading" class="footer loading">加载中…</div>
      <div v-else-if="!hasMore" class="footer done">没有更多了</div>
      <div v-else class="footer hint">↓ 继续下滚加载</div>
    </div>

    <p class="tip">多滚几次：列表越长，整表投影越慢。</p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 440px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.82rem; font-weight: 600; margin: 0 0 8px; }
.badge.bad { background: #fdecea; color: #c0392b; }
.meta { font-size: 0.82rem; color: #666; margin: 0 0 10px; }
.metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; }
.metric { background: #f6f8fa; border-radius: 8px; padding: 8px 10px; }
.label { display: block; font-size: 0.7rem; color: #888; }
.value { display: block; font-size: 1.2rem; font-weight: 700; margin-top: 2px; }
.value.warn { color: #e74c3c; }
.actions { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
button { padding: 5px 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.8rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.viewport { overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; }
.row { display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border-bottom: 1px solid #f0f0f0; font-size: 0.82rem; box-sizing: border-box; }
.title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.members { color: #42b883; font-size: 0.75rem; margin-left: 8px; }
.footer { text-align: center; padding: 10px; font-size: 0.78rem; color: #999; }
.footer.loading { color: #e67e22; }
.tip { font-size: 0.78rem; color: #888; margin: 10px 0 0; line-height: 1.5; }
</style>
