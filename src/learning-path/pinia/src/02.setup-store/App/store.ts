import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface CartItem {
  id: number
  name: string
  price: number
  qty: number
}

// Setup Store：用组合式函数描述
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const coupon = ref<string | null>(null)

  // getter：等价 Options Store 中的 getters
  const totalQty = computed(() => items.value.reduce((sum, it) => sum + it.qty, 0))
  const subtotal = computed(() =>
    items.value.reduce((sum, it) => sum + it.qty * it.price, 0),
  )

  function add(item: CartItem) {
    const exist = items.value.find((i) => i.id === item.id)
    if (exist) exist.qty += item.qty
    else items.value.push({ ...item })
  }

  function clear() {
    items.value = []
    coupon.value = null
  }

  return { items, coupon, totalQty, subtotal, add, clear }
})