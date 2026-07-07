import { ref, computed } from 'vue'

// 一个简单的创建虚拟节点的函数
function createVNode(tag, props, children) {
  return {
    tag,
    props: props || {},
    children: children || []
  }
}

// 创建初始虚拟 DOM
const vNode = ref(
  createVNode('div', { class: 'container' }, [
    createVNode('h1', { style: 'color: blue' }, ['Hello, Virtual DOM']),
    createVNode('p', {}, ['这是一个虚拟 DOM 节点示例'])
  ])
)

// 格式化为字符串显示
const vNodeString = computed(() => {
  return JSON.stringify(vNode.value, null, 2)
})

// 更新虚拟节点
function updateVNode() {
  // TODO: 尝试修改此函数，创建一个不同的虚拟 DOM 结构
  vNode.value = createVNode('div', { class: 'container updated' }, [
    createVNode('h1', { style: 'color: red' }, ['Hello, Updated Virtual DOM']),
    createVNode('p', {}, ['虚拟 DOM 已更新']),
    createVNode('button', { disabled: false }, ['点击我'])
  ])
}
