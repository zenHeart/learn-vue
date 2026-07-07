export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
  // TODO: 在这里添加 watch 选项来监听 count 的变化
  // 提示: 使用 watch: { count(newValue, oldValue) { ... } }
}
