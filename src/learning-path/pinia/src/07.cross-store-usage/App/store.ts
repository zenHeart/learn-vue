import { defineStore } from 'pinia'
import { ref } from 'vue'

// 库存 store
export const useInventoryStore = defineStore('inventory', () => {
  const stock = ref<Record<number, number>>({ 1: 100, 2: 50 })
  function take(productId: number, qty: number) {
    stock.value[productId] = (stock.value[productId] ?? 0) - qty
  }
  return { stock, take }
})

// 用户积分 store
export const usePointsStore = defineStore('points', () => {
  const balance = ref(1000)
  function spend(n: number) { balance.value -= n }
  return { balance, spend }
})

// 购物车 store：跨域调用
export const useCartStore = defineStore('cart', () => {
  const items = ref<{ id: number; qty: number; price: number }[]>([])

  async function checkout() {
    // 在 action 中调用其它 store——Pinia 推荐写法
    const inventory = useInventoryStore()
    const points = usePointsStore()
    const total = items.value.reduce((s, i) => s + i.price * i.qty, 0)

    // 扣库存
    items.value.forEach((i) => inventory.take(i.id, i.qty))
    // 扣积分
    points.spend(total)
    // 清空购物车
    items.value = []
  }

  return { items, checkout }
})