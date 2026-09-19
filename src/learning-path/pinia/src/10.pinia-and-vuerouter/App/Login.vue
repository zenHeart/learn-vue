<template>
  <section class="login">
    <h3>登录</h3>
    <p>输入用户名（admin 可获得管理员权限）</p>
    <input v-model="name" placeholder="用户名" />
    <button @click="onLogin">登录</button>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './store'

const name = ref('')
const route = useRoute()
const auth = useAuthStore()

function onLogin() {
  if (!name.value) return
  auth.loginAndGo(name.value, (route.query.redirect as string) || '/')
}
</script>