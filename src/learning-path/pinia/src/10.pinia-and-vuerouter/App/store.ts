import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ name: string; roles: string[] } | null>(null)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.roles.includes('admin') ?? false)

  function login(name: string) {
    user.value = { name, roles: name === 'admin' ? ['admin'] : ['user'] }
  }

  function logout() {
    user.value = null
  }

  // 业务：登录后跳转
  function loginAndGo(name: string, redirect?: string) {
    login(name)
    const router = useRouter()
    router.replace(redirect || '/')
  }

  function logoutAndGoLogin() {
    logout()
    const router = useRouter()
    router.replace({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
  }

  return { user, isLoggedIn, isAdmin, login, logout, loginAndGo, logoutAndGoLogin }
})