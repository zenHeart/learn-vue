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
  }
  // TODO: Vue 2 中没有 watchEffect，但你可以使用 watch 选项实现类似功能
  // 提示: 使用 watch: { count: {...}, message: {...} }
}
