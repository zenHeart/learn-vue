import { ref, computed } from 'vue'

// 一个更完整的创建虚拟节点的函数
function createVNode(tag, props, children) {
  return {
    tag,
    props: props || {},
    children: children || [],
    key: props && props.key
  }
}

// 创建初始虚拟 DOM
const vNode = ref(
  createVNode('div', { class: 'container', id: 'app' }, [
    createVNode('h1', { style: 'color: blue; font-size: 24px' }, ['Hello, Virtual DOM']),
    createVNode('p', { 'data-test': 'description' }, ['这是一个虚拟 DOM 节点示例']),
    createVNode('ul', { class: 'list' }, [
      createVNode('li', { key: 1 }, ['第一项']),
      createVNode('li', { key: 2 }, ['第二项']),
      createVNode('li', { key: 3 }, ['第三项'])
    ])
  ])
)

// 格式化为字符串显示
const vNodeString = computed(() => {
  return JSON.stringify(vNode.value, null, 2)
})

// 更新虚拟节点
function updateVNode() {
  // 创建一个更复杂的虚拟 DOM 结构，模拟节点的增删改
  vNode.value = createVNode('div', { class: 'container updated', id: 'app' }, [
    createVNode('h1', { style: 'color: red; font-size: 28px' }, ['Hello, Updated Virtual DOM']),
    // 删除了之前的 p 元素
    createVNode('div', { class: 'new-content' }, [
      createVNode('p', { 'data-test': 'new-desc' }, ['虚拟 DOM 已更新']),
      createVNode('button', { disabled: false, onClick: 'alert("点击")' }, ['点击我'])
    ]),
    // 更新了列表，移动了项目顺序并添加了新项
    createVNode('ul', { class: 'list updated' }, [
      createVNode('li', { key: 3 }, ['现在是第一项']), // 移动了位置
      createVNode('li', { key: 4 }, ['新增项目']), // 新增
      createVNode('li', { key: 2 }, ['现在是第三项']) // 移动了位置
      // 删除了 key=1 的项
    ])
  ])
}
