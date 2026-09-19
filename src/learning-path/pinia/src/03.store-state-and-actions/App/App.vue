<template>
  <div class="app">
    <h2>state 解构与变更</h2>
    <p class="hint">下方两个 store 演示：响应式解构 vs 普通解构、$patch / $reset</p>

    <section class="block">
      <h3>1. 计数器（Options Store）</h3>
      <p>当前 count：<strong>{{ counter.count }}</strong></p>
      <p>history：<code>{{ counter.history }}</code></p>

      <button @click="counter.inc()">counter.inc()</button>
      <button @click="counter.bump(5)">counter.bump(5)（函数式 $patch）</button>
      <button @click="counter.$patch({ count: 0 })">$patch 重置 count</button>
      <button @click="counter.$reset()">$reset</button>

      <div class="row">
        <span>响应式解构（storeToRefs）：count={{ rCount }}</span>
        <button @click="rCount += 1">+1（响应式）</button>
      </div>
      <div class="row">
        <span>普通解构（会丢响应式）：count={{ brokenCount }}</span>
        <button @click="brokenCount += 1">+1（已断开）</button>
      </div>
    </section>

    <section class="block">
      <h3>2. 购物车（Setup Store，自定义 $reset）</h3>
      <button @click="cart.items.push({ id: 1, name: 'item', qty: 1 })">加入</button>
      <button @click="cart.$reset()">$reset</button>
      <p>items：<code>{{ cart.items }}</code></p>
    </section>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore, useCartStore } from './store'

const counter = useCounterStore()
const cart = useCartStore()

// 响应式解构：返回 ref 集合
const { count: rCount } = storeToRefs(counter)
// 普通解构：丢失响应式（仅用作对比）
const { count: brokenCount } = counter
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app .block { margin-top: 1rem; padding: 1rem; border: 1px solid #eaecef; border-radius: 6px; background: #fff; }
.app button { padding: .25rem .6rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; margin-right: .25rem; }
.app .row { display: flex; gap: .5rem; align-items: center; margin: .25rem 0; }
.app code { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
</style>