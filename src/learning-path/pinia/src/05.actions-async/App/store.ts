import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchUser } from './api'

export const useUserStore = defineStore('user', () => {
  const current = ref<Awaited<ReturnType<typeof fetchUser>> | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load(id: number, shouldFail = false) {
    loading.value = true
    error.value = null
    try {
      current.value = await fetchUser(id, shouldFail)
    } catch (e: any) {
      error.value = e.message ?? 'unknown error'
    } finally {
      loading.value = false
    }
  }

  return { current, loading, error, load }
})