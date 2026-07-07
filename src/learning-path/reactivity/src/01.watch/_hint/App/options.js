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
  },
  watch: {
    count(newValue, oldValue) {
      console.log(`计数从 ${oldValue} 变为 ${newValue}`)
    }
  }
}
