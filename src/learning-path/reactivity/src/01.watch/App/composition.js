import { ref } from 'vue'

// 创建一个响应式的计数状态
const count = ref(0)

// 增加计数的函数
function increment() {
  count.value++
}

// TODO: 在这里添加 watch 函数来监听 count 的变化
// 提示: 使用 watch(count, (newValue, oldValue) => { ... })
