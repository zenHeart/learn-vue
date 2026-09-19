import { defineComponent, PropType } from 'vue'

interface TreeNode { id: number; label: string; children?: TreeNode[] }

// 递归渲染组件：演示 h() / 模板等价的 TSX 写法
export default defineComponent({
  name: 'DynamicTree',
  props: {
    nodes: { type: Array as PropType<TreeNode[]>, required: true },
  },
  setup(props) {
    return () => (
      <ul class="tree">
        {props.nodes.map((n) => (
          <li key={n.id}>
            <span>{n.label}</span>
            {n.children && <DynamicTree nodes={n.children} />}
          </li>
        ))}
      </ul>
    )
  },
})
