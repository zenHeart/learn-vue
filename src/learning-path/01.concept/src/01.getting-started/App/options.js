export default {
  data() {
    return {
      state: {
        count: 0
      }
    }
  },
  computed: {
    // 计算属性：两倍计数值
    'state.double': function() {
      return this.state.count * 2
    }
  },
  methods: {
    // 增加计数方法
    increment() {
      this.state.count++
    }
  }
}
