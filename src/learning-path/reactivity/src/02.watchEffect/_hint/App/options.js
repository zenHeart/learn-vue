export default {
  data() {
    return {
      count: 0,
      message: '你好，Vue!'
    }
  },
  methods: {
    increment() {
      this.count++
    },
    updateMessage() {
      this.message = '消息已更新! - ' + new Date().toLocaleTimeString()
    }
  },
  // Vue 2 中使用 watch 选项模拟 watchEffect 的行为
  watch: {
    count: {
      handler(newVal) {
        console.log(`当前计数: ${newVal}, 当前消息: ${this.message}`)
      },
      immediate: true // 立即执行一次
    },
    message: {
      handler(newVal) {
        console.log(`当前计数: ${this.count}, 当前消息: ${newVal}`)
      },
      immediate: true // 立即执行一次
    }
  }
}
