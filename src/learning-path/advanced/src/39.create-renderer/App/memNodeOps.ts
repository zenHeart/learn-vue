// 内存渲染器的 nodeOps —— 这是 createRenderer 注入的 9 个方法
// 这里是 stub renderer 的写法，常见于单元测试：跑通整条组件渲染链路，但
// 不操作真实 DOM，最终产物是一棵 JS 对象树，可以序列化比对。
import type { RendererOptions } from 'vue'

export interface MemNode {
  tag: string
  type: string | symbol
  props: Record<string, unknown>
  children: MemNode[]
  text: string | null
}

export interface MemNodeOps {
  nodeOps: Omit<RendererOptions<MemNode, MemNode>, 'patchProp'>
  ops: {
    createElement: (node: MemNode) => void
    createText: (node: MemNode) => void
    setText: (node: MemNode, text: string) => void
    insert: (child: MemNode, parent: MemNode) => void
    remove: (child: MemNode) => void
    querySelector: (selector: string) => MemNode | null
    setScopeId: (node: MemNode, id: string) => void
    cloneNode: (node: MemNode) => MemNode
    patchProp: (node: MemNode, key: string, prev: unknown, next: unknown) => void
  }
}

let counter = 0

export function createMemNodeOps(log: (line: string) => void): MemNodeOps {
  const opsLog: string[] = []

  function appendOp(line: string) {
    const entry = `[#${++counter}] ${line}`
    opsLog.push(entry)
    log(entry)
  }

  return {
    nodeOps: {
      createElement(type: string): MemNode {
        const node: MemNode = {
          tag: type,
          type,
          props: {},
          children: [],
          text: null,
        }
        appendOp(`createElement(${type})`)
        return node
      },

      createText(text: string): MemNode {
        const node: MemNode = {
          tag: '#text',
          type: '#text',
          props: {},
          children: [],
          text,
        }
        appendOp(`createText("${text.slice(0, 16)}")`)
        return node
      },

      setText(node: MemNode, text: string) {
        node.text = text
        appendOp(`setText("${text.slice(0, 16)}")`)
      },

      insert(child: MemNode, parent: MemNode, _anchor?: MemNode | null) {
        parent.children.push(child)
        appendOp(`insert(${child.tag} -> ${parent.tag})`)
      },

      remove(child: MemNode) {
        appendOp(`remove(${child.tag})`)
        // 内存里不必真正操作，依赖父引用被丢弃后被 GC
        void child
      },

      querySelector(_selector: string): MemNode | null {
        appendOp(`querySelector("${_selector}")`)
        return null
      },

      setScopeId(node: MemNode, id: string) {
        node.props['data-v-' + id] = ''
        appendOp(`setScopeId(${id})`)
      },

      cloneNode(node: MemNode): MemNode {
        appendOp(`cloneNode(${node.tag})`)
        return {
          tag: node.tag,
          type: node.type,
          props: { ...node.props },
          children: node.children.map(c => ({ ...c })),
          text: node.text,
        }
      },
    },

    ops: {
      createElement: (node) => appendOp(`[patchProp hook] createElement ${node.tag}`),
      createText: (node) => appendOp(`[patchProp hook] createText ${node.text}`),
      setText: (node, text) => appendOp(`[patchProp hook] setText ${text}`),
      insert: (child, parent) => appendOp(`[patchProp hook] insert ${child.tag} -> ${parent.tag}`),
      remove: (child) => appendOp(`[patchProp hook] remove ${child.tag}`),
      querySelector: (sel) => appendOp(`[patchProp hook] querySelector ${sel}`),
      setScopeId: (node, id) => appendOp(`[patchProp hook] setScopeId ${id} ${node.tag}`),
      cloneNode: (node) => appendOp(`[patchProp hook] cloneNode ${node.tag}`),
      patchProp: (node, key, prev, next) => {
        const prevStr = prev === undefined ? '∅' : JSON.stringify(prev).slice(0, 14)
        const nextStr = next === undefined ? '∅' : JSON.stringify(next).slice(0, 14)
        appendOp(`[patchProp hook] ${node.tag}.${key}: ${prevStr} -> ${nextStr}`)
      },
    },
  }
}