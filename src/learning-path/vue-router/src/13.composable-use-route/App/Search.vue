<template>
  <section class="search">
    <div class="row">
      <label>关键词：</label>
      <input :value="q" @input="onQInput" />
      <span>当前 q：<code>{{ q }}</code></span>
    </div>

    <div class="row">
      <label>页码：</label>
      <button @click="page = 1">第 1 页</button>
      <button @click="page = 2">第 2 页</button>
      <button @click="page = 3">第 3 页</button>
      <span>当前 page：<code>{{ page }}</code></span>
    </div>

    <div class="row">
      <label>仅看付费：</label>
      <input type="checkbox" :checked="paid" @change="onPaidChange" />
      <span>当前 paid：<code>{{ paid }}</code></span>
    </div>

    <div class="result">
      <p>伪结果：与 {{ q }} 相关，第 {{ page }} 页{{ paid ? '（仅付费）' : '' }}。</p>
      <p class="hint">URL 同步：<code>{{ route.fullPath }}</code></p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useRouteQueryNumber, useRouteQueryString, useRouteQueryBoolean } from './use-route-query'

const route = useRoute()
const q = useRouteQueryString('q', 'vue')
const page = useRouteQueryNumber('page', 1)
const paid = useRouteQueryBoolean('paid', false)

function onQInput(e: Event) {
  q.value = (e.target as HTMLInputElement).value
}
function onPaidChange(e: Event) {
  paid.value = (e.target as HTMLInputElement).checked
}
</script>