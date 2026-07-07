export default {
  data() {
    return {
      vNode: this.createInitialVNode()
    }
  },
  computed: {
    vNodeString() {
      return JSON.stringify(this.vNode, null, 2)
    }
  },
  methods: {
    // 创建虚拟节点辅助函数
    createVNode(tag, props, children) {
      return {
        tag,
        props: props || {},
        children: children || [],
        key: props && props.key
      }
    },
    
    // 创建初始虚拟 DOM
    createInitialVNode() {
      return this.createVNode('div', { class: 'container', id: 'app' }, [
        this.createVNode('h1', { style: 'color: blue; font-size: 24px' }, ['Hello, Virtual DOM']),
        this.createVNode('p', { 'data-test': 'description' }, ['这是一个虚拟 DOM 节点示例']),
        this.createVNode('ul', { class: 'list' }, [
          this.createVNode('li', { key: 1 }, ['第一项']),
          this.createVNode('li', { key: 2 }, ['第二项']),
          this.createVNode('li', { key: 3 }, ['第三项'])
        ])
      ])
    },
    
    // 更新虚拟节点
    updateVNode() {
      // 创建一个更复杂的虚拟 DOM 结构，模拟节点的增删改
      this.vNode = this.createVNode('div', { class: 'container updated', id: 'app' }, [
        this.createVNode('h1', { style: 'color: red; font-size: 28px' }, ['Hello, Updated Virtual DOM']),
        // 删除了之前的 p 元素
        this.createVNode('div', { class: 'new-content' }, [
          this.createVNode('p', { 'data-test': 'new-desc' }, ['虚拟 DOM 已更新']),
          this.createVNode('button', { disabled: false, onClick: 'alert("点击")' }, ['点击我'])
        ]),
        // 更新了列表，移动了项目顺序并添加了新项
        this.createVNode('ul', { class: 'list updated' }, [
          this.createVNode('li', { key: 3 }, ['现在是第一项']), // 移动了位置
          this.createVNode('li', { key: 4 }, ['新增项目']), // 新增
          this.createVNode('li', { key: 2 }, ['现在是第三项']) // 移动了位置
          // 删除了 key=1 的项
        ])
      ])
    }
  }
}
