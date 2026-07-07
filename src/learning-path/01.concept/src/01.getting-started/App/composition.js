import { reactive, computed } from 'vue'

export default {
  setup() {
    // 创建响应式状态
    const state = reactive({
      count: 0,
      // 计算属性：自动根据 count 计算 double
      double: computed(() => state.count * 2)
    })

    // 方法：增加计数
    function increment() {
      state.count++
    }

    // 返回模板中需要的数据和方法
    return {
      state,
      increment
    }
  }
}
