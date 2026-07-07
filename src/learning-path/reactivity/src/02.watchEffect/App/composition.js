import { ref } from 'vue'

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

// TODO: 在这里添加 watchEffect 函数
// 提示: 使用 watchEffect(() => { ... })
