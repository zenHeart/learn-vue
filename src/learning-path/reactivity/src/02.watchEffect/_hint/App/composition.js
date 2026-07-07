import { ref, watchEffect } from 'vue'

// 创建响应式状态
const count = ref(0)
const message = ref('你好，Vue!')

// 修改状态的函数
function increment() {
  count.value++
}

function updateMessage() {
  message.value = '消息已更新! - ' + new Date().toLocaleTimeString()
}

// 使用 watchEffect 自动追踪依赖
watchEffect(() => {
  console.log(`当前计数: ${count.value}, 当前消息: ${message.value}`)
  // watchEffect 会自动追踪 count 和 message，当它们变化时重新执行此函数
})
