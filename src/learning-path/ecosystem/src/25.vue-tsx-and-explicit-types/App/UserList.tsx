// 完整 TSX 组件演示
import { defineComponent, ref, type PropType, type Ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

export default defineComponent({
  name: 'UserList',
  props: {
    users: {
      type: Array as PropType<User[]>,
      required: true,
    },
    title: {
      type: String,
      default: '列表',
    },
    selectable: {
      type: Boolean,
      default: true,
    },
  },
  emits: {
    select: (_id: number) => true,
  },
  setup(props, { emit }) {
    // 显式 Ref 类型，避免后面被隐式 any
    const selectedId: Ref<number | null> = ref(null)

    function pick(id: number): void {
      selectedId.value = id
      emit('select', id)
    }

    return { selectedId, pick }
  },
  render() {
    // 类型来源：this.title / this.users / this.selectedId / this.pick 都自动推断
    return (
      <div class="user-list">
        <h3>{this.title}</h3>
        <ul>
          {this.users.map((u: User) => (
            <li
              key={u.id}
              class={{ active: this.selectedId === u.id, disabled: !this.selectable }}
              onClick={() => this.selectable && this.pick(u.id)}
            >
              <strong>{u.name}</strong>
              <span class="email">{u.email}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  },
})