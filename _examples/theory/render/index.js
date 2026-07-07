import * as domAPIConfig from './DOMApi.js'
import * as patchChildren from './diff.js'

const NodeTypeMap = {
  Text: Symbol('Text'),
  Comment: Symbol('Comment'),
}
const NodeFactory = {
  [NodeTypeMap.Text]: (text) => ({
    type: NodeTypeMap.Text,
    children: text,
  }),
  [NodeTypeMap.Comment]: (text) => ({
    type: NodeTypeMap.Comment,
    children: text,
  }),
}

function formatVnode(vNode) {
  // 如果传入的是字符串，则直接返回文本节点
  if (typeof vNode === 'string') {
    return NodeFactory[NodeTypeMap.Text](vNode);
  } else {
    return vNode;
  }
}



export function createRenderer(hostConfig) {
  // 1. 通过 hostConfig 隔离平台的操作
  const domAPI = hostConfig


  /**
   * 处理首次挂载逻辑
   * @param {*} vnode vdom, 格式化后的节点类型
   * @param {*} container 容器
   */
  function mountElement(vnode, container) {
    const nodeType = vnode.type;

    switch (nodeType) {
      case NodeTypeMap.Text: // 文本节点直接插入
        const textNode = vnode.el = domAPI.createTextNode(vnode.children);
        textNode._vnode = vnode;
        domAPI.insert(textNode, container);
        break;
      case NodeTypeMap.Comment: // 注释节点不处理
        // 待办
        break;
      default: // 默认节点作为 dom 元素挂载
        const { type, props, children } = vnode;
        const el = vnode.el = domAPI.createElement(type);
        el._vnode = vnode;
        // 2. 设置属性
        for (const key in props) {
          domAPI.patchProps(el, key, null, props[key]);
        }

        // 3. 处理 children
        if (children) {
          // 如果 children 是文本节点
          if (typeof children === 'string') {
            domAPI.setElementText(el, children);
          } else if (Array.isArray(children)) {
            // 如果 children 是数组
            children.forEach(child => {
              patch(null, child, el);
            });
          }
        }
        domAPI.insert(el, container);
        break;
    }
  }

  /**
   * 更新属性
   */
  function updateProps(oldVnode, vnode) {
    // 1， 提取节点上元素
    const el = vnode.el = oldVnode.el;
    // 2. 获取节点上属性
    const oldProps = oldVnode.props || {};
    const newProps = vnode.props || {};

    // 3. 遍历新节点的属性，更新属性
    for (const key in newProps) {
      domAPI.patchProps(el, key, oldProps[key], newProps[key]);
    }

    // 4. 遍历旧节点的属性，删除新节点上不存在属性
    for (const key in oldProps) {
      if (!(key in newProps)) {
        domAPI.patchProps(el, key, oldProps[key], null);
      }
    }
  }

  /**
   * 更新 children
   * 
   * @param {*} oldVnode 
   * @param {*} vnode 
   * @param {*} container 
   * 
   * 此处 children 存在 空、string、array 三种情况
   * 旧 -> 新 存在 9 中映射关系
   * 1. 空 -> 空 不处理
   * 2. 空 -> string 替换文本
   * 3. 空 -> array 插入所有子节点
   * 4. string -> 空 删除文本
   * 5. string -> string 替换文本
   * 6. string -> array 先删除文本，再插入所有子节点
   * 7. array -> 空 删除所有子节点
   * 8. array -> string 先删除所有子节点，再插入文本
   * 9. array -> array 比较新旧子节点，更新子节点
   *
   * 
   */
  function updateChildren(oldVnode, vnode) {
    const container = vnode.el = oldVnode.el;
    // 获取 children
    const oldChildren = oldVnode.children;
    const newChildren = vnode.children;


    // 之前没有元素，现在新增元素要挂载到 container
    // 1. 空 -> 空 不处理
    if (!oldChildren && !newChildren) {
      return;
    }
    // 2. 空 -> string 替换文本
    if (!oldChildren && typeof newChildren === 'string') {
      domAPI.setElementText(container, newChildren);
      return;
    }
    // 3. 空 -> array 插入所有子节点
    if (!oldChildren && Array.isArray(newChildren)) {
      newChildren.forEach(child => {
        patch(null, child, container);
      });
      return;
    }

    // 4. string -> 空 删除文本
    if (typeof oldChildren === 'string' && !newChildren) {
      domAPI.setElementText(container, '');
      return;
    }
    // 5. string -> string 替换文本
    if (typeof oldChildren === 'string' && typeof newChildren === 'string') {
      domAPI.setElementText(container, newChildren);
      return;
    }
    // 6. string -> array 先删除文本，再插入所有子节点
    if (typeof oldChildren === 'string' && Array.isArray(newChildren)) {
      domAPI.setElementText(container, '');
      newChildren.forEach(child => {
        patch(null, child, container);
      });
      return;
    }
    // 7. array -> 空 删除所有子节点
    if (Array.isArray(oldChildren) && !newChildren) {
      oldChildren.forEach(child => {
        unmount(child);
      });
      return;
    }
    // 8. array -> string 先删除所有子节点，再插入文本
    if (Array.isArray(oldChildren) && typeof newChildren === 'string') {
      oldChildren.forEach(child => {
        unmount(child);
      });
      domAPI.setElementText(container, newChildren);
      return;
    }
    // 9. array -> array 先删除旧节点，再插入新节点
    if (Array.isArray(oldChildren) && Array.isArray(newChildren)) {
      patchChildren.latest(oldChildren, newChildren, container, {
        patch,
        unmount,
        insert: domAPI.insert,
      });
    }
  }


  /**
   * 处理更新逻辑 
   * 
   * @param {*} oldVnode 
   * @param {*} vnode 
   * @param {*} container 
   * @returns 
   */
  function patchElement(oldVnode, vnode, container) {
    // 1. 如果不存在 oldVnode ，则直接挂载新节点
    if (!oldVnode) {
      mountElement(vnode, container);
      return;
    }
    // 2. 如果新旧节点类型不一致，则直接卸载旧节点，挂载新节点
    if (oldVnode.type !== vnode.type) {
      unmount(oldVnode);
      mountElement(vnode, container);
      return;
    }

    // 3. 如果新旧节点类型一致，则更新属性和 children
    // 3.1. 获取旧节点的元素
    updateProps(oldVnode, vnode);
    // 3.2. 获取新旧节点的 children, 直接在旧节点上触发更新逻辑
    updateChildren(oldVnode, vnode);
  }

  /**
   * 处理首次和增量渲染
   * 
   * @param {*} oldVnode 
   * @param {*} vnode 
   * @param {*} container 
   */
  function patch(oldVnode, vnode, container) {
    // 1. 如果新旧节点不一致，先卸载旧节点
    if (oldVnode && oldVnode?.type !== vnode?.type) {
      unmount(oldVnode);
      oldVnode = null;
    }

    // 2. 格式化 vnode ，处理 text 节点
    oldVnode = formatVnode(oldVnode);
    vnode = formatVnode(vnode);



    // 3. 处理节点
    if (!oldVnode) {
      // 旧节点不存在直接挂载新节点
      mountElement(vnode, container);
      return;
    } else {
      // 旧节点存在，更新节点
      patchElement(oldVnode, vnode, container);
    }
  }

  function unmount(vnode) {
    const el = vnode.el;
    const parent = el.parentNode;
    if (parent) {
      domAPI.removeChild(parent, el);
    }
  }


  /**
   * 渲染函数
   * 接受 vdom， 挂载点，并将 vdom 渲染到挂载点上
   * @param {*} vnode 
   * @param {*} container 
   * 
   * 核心逻辑包括
   * 1. 首次/增量渲染处理
   * 2. 卸载处理
   */
  function render(vnode, container) {
    // 1. 如果 vnode 存在，则更新 vnode
    if (vnode) {
      // 调用更新逻辑
      patch(container._vnode, vnode, container);
    } else {
      // 2. 如果 vnode 不存在，则卸载 vnode
      if (container._vnode && !vnode) {
        unmount(container._vnode);
      }
      // 3. 如果 vnode 不存在且没有历史 vnode，则不做任何处理
    }

    // 4. 完成渲染后，将历史 vnode 保存到容器上，用于下一次渲染
    container._vnode = vnode;
  }

  return {
    render
  }
}

export default createRenderer({
  ...domAPIConfig
})