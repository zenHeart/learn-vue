<template>
  <section class="login">
    <h3>登录</h3>
    <p>登录后会跳回 <code>{{ route.query.redirect ?? '/' }}</code></p>
    <button @click="onLogin">立即登录</button>
  </section>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function onLogin() {
  // 真实场景调用登录接口
  ;(window as unknown as { __tokenStore__: { value: string } }).__tokenStore__.value = 'mock-jwt-123'
  router.replace((route.query.redirect as string) || '/')
}
</script>