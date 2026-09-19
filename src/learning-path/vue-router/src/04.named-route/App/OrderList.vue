<template>
  <section>
    <h3>订单列表</h3>
    <p class="hint">尝试切换两种写法</p>

    <h4>方式 A：直接拼接路径</h4>
    <div class="row">
      <RouterLink :to="`/orders/${1001}?from=list`">订单 1001（字符串）</RouterLink>
      <RouterLink :to="`/orders/${1002}?from=list`">订单 1002（字符串）</RouterLink>
    </div>

    <h4>方式 B：命名路由</h4>
    <div class="row">
      <RouterLink :to="{ name: 'order-detail', params: { id: 1001 }, query: { from: 'list' } }">
        订单 1001（命名）
      </RouterLink>
      <RouterLink :to="{ name: 'order-detail', params: { id: 1002 }, query: { from: 'list' } }">
        订单 1002（命名）
      </RouterLink>
    </div>

    <button class="programmatic" @click="programmaticPush">
      通过 router.push 跳到 1003
    </button>
  </section>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
function programmaticPush() {
  // 推荐写法：name + params + query，路由表若改名 IDE 会立刻报错
  router.push({ name: 'order-detail', params: { id: 1003 }, query: { from: 'programmatic' } })
}
</script>