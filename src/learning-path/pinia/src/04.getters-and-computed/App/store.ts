import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface Product {
  id: number
  name: string
  category: string
  price: number
}

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref<Product[]>([
    { id: 1, name: 'Vue 入门', category: 'book', price: 60 },
    { id: 2, name: 'Pinia 指南', category: 'book', price: 45 },
    { id: 3, name: '键盘', category: 'hardware', price: 600 },
    { id: 4, name: '显示器', category: 'hardware', price: 1800 },
  ])

  // getter 间依赖
  const totalCount = computed(() => products.value.length)
  const avgPrice = computed(() => {
    const sum = products.value.reduce((s, p) => s + p.price, 0)
    return totalCount.value === 0 ? 0 : sum / totalCount.value
  })

  // 参数化 selector：返回函数
  const byCategory = computed(
    () => (category: string) => products.value.filter((p) => p.category === category),
  )
  const findById = computed(() => (id: number) => products.value.find((p) => p.id === id))

  return { products, totalCount, avgPrice, byCategory, findById }
})