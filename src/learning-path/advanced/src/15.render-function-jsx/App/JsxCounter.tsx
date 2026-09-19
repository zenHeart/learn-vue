import { defineComponent, ref } from 'vue'

// 等价于模板写法，但使用 TSX 语法
export default defineComponent({
  name: 'JsxCounter',
  setup() {
    const count = ref(0)
    return () => (
      <div class="jsx-counter">
        <strong>JSX counter</strong>
        <div>value: {count.value}</div>
        <button onClick={() => count.value++}>+</button>
        <button onClick={() => count.value--}>-</button>
      </div>
    )
  },
})
