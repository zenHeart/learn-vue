import { ref, watch } from 'vue'

// 创建一个响应式的计数状态
const count = ref(0)

// 增加计数的函数
function increment() {
  count.value++
}

// 使用 watch 监听 count 的变化
watch(count, (newValue, oldValue) => {
  console.log(`计数从 ${oldValue} 变为 ${newValue}`)
})
