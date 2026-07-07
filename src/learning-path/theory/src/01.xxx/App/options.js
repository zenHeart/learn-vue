export default {
  data() {
    return {
      vNode: {
        tag: 'div',
        props: { class: 'container' },
        children: [
          {
            tag: 'h1',
            props: { style: 'color: blue' },
            children: ['Hello, Virtual DOM']
          },
          {
            tag: 'p',
            props: {},
            children: ['这是一个虚拟 DOM 节点示例']
          }
        ]
      }
    }
  },
  computed: {
    vNodeString() {
      return JSON.stringify(this.vNode, null, 2)
    }
  },
  methods: {
    updateVNode() {
      // TODO: 尝试修改此函数，创建一个不同的虚拟 DOM 结构
      this.vNode = {
        tag: 'div',
        props: { class: 'container updated' },
        children: [
          {
            tag: 'h1',
            props: { style: 'color: red' },
            children: ['Hello, Updated Virtual DOM']
          },
          {
            tag: 'p',
            props: {},
            children: ['虚拟 DOM 已更新']
          },
          {
            tag: 'button',
            props: { disabled: false },
            children: ['点击我']
          }
        ]
      }
    }
  }
}
