# 递归树组件原理与实现（参考 element-ui el-tree）

## 目录

1. [概述](#1-概述)
2. [递归组件原理](#2-递归组件原理)
3. [TreeStore 数据结构](#3-treestore-数据结构)
4. [el-tree 核心概念](#4-el-tree-核心概念)
5. [父子节点通信](#5-父子节点通信)
6. [展开收起逻辑](#6-展开收起逻辑)
7. [节点选择机制](#7-节点选择机制)
8. [自定义节点插槽](#8-自定义节点插槽)
9. [常见问题与最佳实践](#9-常见问题与最佳实践)
10. [参考资料](#10-参考资料)

---

## 1. 概述

### 1.1 树形数据结构在前端的重要性

树形数据结构是前端开发中最常用的数据结构之一，广泛应用于：

- **文件系统**：文件夹与文件的层级结构
- **组织架构**：公司部门、团队的人员组织
- **分类体系**：电商商品分类、内容标签树
- **菜单导航**：后台系统的侧边栏菜单
- **评论系统**：嵌套回复的楼层结构

### 1.2 el-tree 在业界的位置

element-ui 的 `el-tree` 是 Vue 生态中最成熟的树形组件：

- **Star 数**：GitHub 上超过 20k star
- **功能完善**：支持懒加载、拖拽、筛选、节点操作
- **设计优雅**：TreeStore 数据与视图分离
- **源码易读**：是学习树组件设计的最佳范本

### 1.3 核心概念一览

| 概念 | 说明 |
|------|------|
| TreeStore | 树数据管理层，存储所有节点状态 |
| 递归组件 | 组件模板中引用自身的机制 |
| 展开状态 | 节点的 expanded 状态独立于数据 |
| 选择状态 | checked/indeterminate 状态管理 |
| 懒加载 | 按需加载子节点数据 |

---

## 2. 递归组件原理

### 2.1 什么是递归组件？

递归组件是指组件在自身模板中引用自身的机制。就像 JavaScript 函数可以递归调用一样，Vue 组件也可以在模板中使用自身来渲染层级结构。

```vue
<!-- TreeNode.vue -->
<template>
  <div class="tree-node">
    <div @click="toggle">
      {{ node.label }}
    </div>
    <!-- 关键：组件在模板中引用自身 -->
    <TreeNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :depth="depth + 1"
    />
  </div>
</template>

<script setup>
defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 }
})

const toggle = () => { /* ... */ }
</script>
```

### 2.2 递归终止条件

递归必须要有终止条件，否则会导致栈溢出。树组件的终止条件是**叶子节点没有子节点**：

```vue
<TreeNode
  v-for="child in node.children"
  v-if="node.children && node.children.length"
  :key="child.id"
  :node="child"
/>
```

### 2.3 组件 name 的重要性

Vue 组件可以通过 `name` 选项在模板中引用自身：

```js
// Vue 2
export default {
  name: 'TreeNode',
  template: '<TreeNode />' // 这里引用自身
}

// Vue 3
export default {
  name: 'TreeNode'
}
// 或使用 defineOptions
<script setup>
defineOptions({ name: 'TreeNode' })
</script>
<template>
  <TreeNode v-if="hasChildren" /> <!-- 引用自身 -->
</template>
```

### 2.4 递归组件的深度问题

递归层级过深可能导致性能问题：

```js
// 限制最大递归深度
const MAX_DEPTH = 10

const TreeNode = {
  props: {
    depth: { type: Number, default: 0 }
  },
  // 当深度超过限制时停止递归
  computed: {
    shouldRenderChildren() {
      return this.depth < MAX_DEPTH && this.node.children?.length
    }
  }
}
```

### 2.5 递归 vs 扁平化渲染

| 方式 | 优点 | 缺点 |
|------|------|------|
| 递归组件 | 结构清晰，符合树结构语义 | 层级深时组件数量爆炸 |
| 扁平化 + indent | 性能好，易于虚拟滚动 | 实现复杂，需手动计算缩进 |

---

## 3. TreeStore 数据结构

### 3.1 为什么需要 TreeStore？

el-tree 的核心设计是**数据与视图分离**：

- **TreeStore**：管理所有节点数据、状态（展开、选中、懒加载）
- **TreeNode 组件**：负责渲染单个节点，不关心全局状态

这种设计的优点：

1. 状态管理集中，便于批量操作
2. 节点状态独立于 DOM，支持虚拟滚动
3. 数据层与视图层解耦，易于测试

### 3.2 TreeStore 核心结构

```js
class TreeStore {
  constructor(options) {
    this.nodes = {}          // 所有节点的 Map，key 为 id
    this.childrenMap = {}    // id -> children[] 的映射
    this.expandedNodeSet = new Set()   // 已展开节点 ID 集合
    this.checkedNodeSet = new Set()     // 已选中节点 ID 集合
    this.currentNode = null             // 当前高亮节点
    this.defaultExpandedKeys = options.defaultExpandedKeys || []
    this.defaultCheckedKeys = options.defaultCheckedKeys || []
  }
}
```

### 3.3 节点数据结构

```js
// 标准的树节点数据
{
  id: 'node-1',
  label: '根节点',
  children: [
    {
      id: 'node-1-1',
      label: '子节点 1',
      children: []
    },
    {
      id: 'node-1-2',
      label: '子节点 2',
      disabled: true  // 可禁用节点
    }
  ],
  // 可选属性
  isLeaf: false,      // 是否叶子节点（用于懒加载）
  expanded: false,    // 是否展开
  checked: false,     // 是否选中
  indeterminate: false // 是否半选（多选时）
}
```

### 3.4 TreeStore 核心方法

```js
class TreeStore {
  // 注册节点到 store
  registerNode(node) {
    this.nodes[node.id] = node
    if (!this.childrenMap[node.id]) {
      this.childrenMap[node.id] = []
    }
  }

  // 获取节点的子节点
  getChildren(nodeId) {
    return this.childrenMap[nodeId] || []
  }

  // 获取父节点
  getParent(nodeId) {
    for (const [pid, children] of Object.entries(this.childrenMap)) {
      if (children.some(c => c.id === nodeId)) {
        return this.nodes[pid]
      }
    }
    return null
  }

  // 获取所有祖先节点
  getAncestors(nodeId) {
    const ancestors = []
    let current = this.getParent(nodeId)
    while (current) {
      ancestors.unshift(current)
      current = this.getParent(current.id)
    }
    return ancestors
  }

  // 设置节点展开状态
  setExpanded(nodeId, expanded) {
    const node = this.nodes[nodeId]
    if (!node) return

    if (expanded) {
      this.expandedNodeSet.add(nodeId)
    } else {
      this.expandedNodeSet.delete(nodeId)
    }
  }

  // 检查节点是否展开
  isExpanded(nodeId) {
    return this.expandedNodeSet.has(nodeId)
  }
}
```

### 3.5 节点路径计算

```js
// 计算从根到某节点的路径
getNodePath(nodeId) {
  const path = []
  let current = this.nodes[nodeId]

  while (current) {
    path.unshift(current)
    current = this.getParent(current.id)
  }

  return path // 如 [根节点, ..., 父节点, 目标节点]
}

// 检查某节点是否是另一个节点的祖先
isAncestor(ancestorId, nodeId) {
  const ancestors = this.getAncestors(nodeId)
  return ancestors.some(a => a.id === ancestorId)
}
```

---

## 4. el-tree 核心概念

### 4.1 el-tree 整体架构

```
el-tree
├── TreeStore         (数据管理层)
│   ├── nodes         (所有节点映射)
│   ├── treeNodeMap   (DOM 节点映射)
│   └── expandedSet   (展开状态集合)
├── el-tree-node      (递归渲染组件)
│   ├── expand-icon   (展开图标)
│   ├── node-content  (节点内容，含插槽)
│   └── children      (递归渲染子节点)
```

### 4.2 节点数据规范化

el-tree 内部会将原始数据规范化，添加运行时状态：

```js
// 规范化后的节点
{
  id: 'node-1',
  label: '节点标签',
  parentId: null,           // 父节点 ID
  level: 0,                 // 层级深度
  expanded: false,           // 是否展开
  checked: false,           // 是否选中
  indeterminate: false,      // 半选状态
  disabled: false,          // 是否禁用
  isLeaf: false,            // 是否叶子
  loaded: false,            // 懒加载是否已加载
  loading: false,           // 懒加载中
  childNodes: []            // 子节点数组（运行时）
}
```

### 4.3 default-expand-all 的实现

```js
// Tree.vue
export default {
  methods: {
    expandAll() {
      // 深度优先遍历所有节点并展开
      const traverse = (nodes) => {
        nodes.forEach(node => {
          node.expanded = true
          if (node.childNodes) {
            traverse(node.childNodes)
          }
        })
      }
      traverse(this.store.nodes)
    }
  }
}
```

### 4.4 empty-text 的处理

```vue
<template v-if="!data.length">
  <div class="el-tree__empty-block">
    <span class="el-tree__empty-text">{{ emptyText }}</span>
  </div>
</template>
```

---

## 5. 父子节点通信

### 5.1 props 向下传递

父组件通过 props 向子组件传递数据：

```vue
<!-- Parent -->
<template>
  <TreeNode
    v-for="child in treeData"
    :key="child.id"
    :node="child"
    :tree-store="treeStore"
  />
</template>

<!-- TreeNode -->
<script setup>
const props = defineProps({
  node: Object,
  treeStore: Object
})
</script>
```

### 5.2 事件向上冒泡

子节点通过 emit 向父组件发送事件：

```js
// TreeNode.vue
const emit = defineEmits(['node-click', 'node-expand', 'node-check'])

const handleClick = () => {
  emit('node-click', props.node)
}

const handleExpand = () => {
  props.treeStore.setExpanded(props.node.id, !isExpanded.value)
  emit('node-expand', props.node)
}

const handleCheck = (checked) => {
  emit('node-check', props.node, checked)
}
```

### 5.3 provide/inject 跨层级传递

深层嵌套的树节点可以通过 provide/inject 获取 store：

```js
// Tree.vue (根组件)
provide('TreeStore', treeStore)

// TreeNode.vue (所有层级)
const treeStore = inject('TreeStore')

// 深层节点不需要 props 一层层传递
const childNode = treeStore.nodes['deep-node-id']
```

### 5.4 v-model 双向绑定

el-tree 支持 v-model 绑定选中节点：

```vue
<el-tree
  v-model="selectedNodes"
  :data="treeData"
  show-checkbox
  node-key="id"
/>
```

这等价于：

```vue
<el-tree
  :model-value="selectedNodes"
  @update:model-value="val => selectedNodes = val"
/>
```

---

## 6. 展开收起逻辑

### 6.1 展开状态存储

展开状态存储在 TreeStore 中，与节点数据分离：

```js
class TreeStore {
  expandedSet = new Set()

  setExpanded(node, expanded) {
    if (expanded) {
      this.expandedSet.add(node.id)
    } else {
      this.expandedSet.delete(node.id)
    }
    // 触发视图更新
    this.broadcast('NodeDom', 'expanded-change', expanded)
  }
}
```

### 6.2 展开动画

el-tree 使用 CSS transition 实现展开动画：

```css
.el-tree-node__children {
  overflow: hidden;
  transition: height 0.3s;
}

.el-tree-node__content {
  transition: background-color 0.3s;
}
```

### 6.3 accordion 手风琴模式

手风琴模式：展开一个节点时自动收起其他同级别节点：

```js
handleExpand(node) {
  if (this.accordion) {
    // 收起所有同级节点
    const siblings = this.treeStore.getChildren(node.parentId)
    siblings.forEach(sibling => {
      if (sibling.id !== node.id) {
        this.treeStore.setExpanded(sibling.id, false)
      }
    })
  }
  this.treeStore.setExpanded(node.id, !node.expanded)
}
```

### 6.4 自动展开到指定节点

```js
// 自动展开从根到目标节点的路径
autoExpandPath(targetId) {
  const ancestors = this.treeStore.getAncestors(targetId)
  ancestors.forEach(ancestor => {
    this.treeStore.setExpanded(ancestor.id, true)
  })
}
```

---

## 7. 节点选择机制

### 7.1 三种选择状态

el-tree 的多选节点有三种状态：

| 状态 | 说明 | DOM 表现 |
|------|------|----------|
| 未选中 | checked = false | 空白复选框 |
| 半选 | indeterminate = true | 灰度复选框 |
| 已选中 | checked = true | 绿色复选框 |

### 7.2 父子联动选择

核心逻辑：选中父节点时自动选中所有子节点，取消选中子节点时视情况取消父节点：

```js
// 选中节点
checkNode(node, checked) {
  // 1. 设置当前节点状态
  this.setChecked(node.id, checked)

  // 2. 递归设置所有子节点
  const traverseChildren = (node) => {
    node.childNodes?.forEach(child => {
      this.setChecked(child.id, checked)
      traverseChildren(child)
    })
  }
  traverseChildren(node)

  // 3. 检查父节点状态
  this.updateParentState(node)
}

// 更新父节点半选状态
updateParentState(node) {
  const parent = this.getParent(node.id)
  if (!parent) return

  const checkedCount = parent.childNodes.filter(c => c.checked).length
  const totalCount = parent.childNodes.length

  if (checkedCount === 0) {
    this.setChecked(parent.id, false)
  } else if (checkedCount === totalCount) {
    this.setChecked(parent.id, true)
  } else {
    // 半选状态
    this.setChecked(parent.id, false, { indeterminate: true })
  }
}
```

### 7.3 单选模式

单选模式下不能选择有子节点的节点：

```js
const handleCheck = (node, checked) => {
  if (this.checkStrictly) return // checkStrictly = true 时不检查父子联动

  if (!node.isLeaf && checked) {
    // 非叶子节点被选中，检查模式
    this.$message.warning('请选择叶子节点')
    return
  }

  // 单选：先取消所有选中，再选中当前
  if (checked) {
    this.treeStore.setAllChecked(false)
    this.treeStore.setChecked(node.id, true)
  } else {
    this.treeStore.setChecked(node.id, false)
  }
}
```

### 7.4 getCheckedKeys 与 getHalfCheckedKeys

```js
// 获取已选中的叶子节点 ID
getCheckedKeys(leafOnly = true) {
  const keys = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      if (node.checked) {
        if (!leafOnly || node.isLeaf) {
          keys.push(node.id)
        }
      }
      if (node.childNodes) {
        traverse(node.childNodes)
      }
    })
  }
  traverse(this.nodes)
  return keys
}

// 获取半选的节点（用于级联选择）
getHalfCheckedKeys() {
  return Array.from(this.checkedSet).filter(id => {
    const node = this.nodes[id]
    return node.indeterminate
  })
}
```

---

## 8. 自定义节点插槽

### 8.1 默认插槽

```vue
<el-tree :data="data">
  <template #default="{ node, data }">
    <span class="custom-label">
      <span>{{ data.label }}</span>
      <span class="count">({{ data.children?.length || 0 }})</span>
    </span>
  </template>
</el-tree>
```

### 8.2 节点操作插槽

```vue
<el-tree :data="data">
  <template #default="{ node, data }">
    <span class="tree-node-content">
      <span>{{ data.label }}</span>
      <span class="actions">
        <el-button size="small" @click.stop="addNode(node)">添加</el-button>
        <el-button size="small" @click.stop="editNode(node)">编辑</el-button>
        <el-button size="small" @click.stop="deleteNode(node)">删除</el-button>
      </span>
    </span>
  </template>
</el-tree>
```

### 8.3 懒加载插槽

```vue
<el-tree
  :props="props"
  :load="loadNode"
  lazy
>
  <template #default="{ node, data }">
    <span>{{ data.label }}</span>
  </template>
</el-tree>

<script setup>
const loadNode = (node, resolve) => {
  if (node.level === 0) {
    return resolve([{ label: '根节点' }])
  }
  // 异步加载子节点
  fetchChildren(node.data.id).then(children => {
    resolve(children)
  })
}
</script>
```

---

## 9. 常见问题与最佳实践

### 9.1 大量节点性能问题

| 优化方案 | 说明 |
|----------|------|
| 虚拟滚动 | 只渲染可视区域节点 |
| 懒加载 | 按需加载子节点 |
| 节点缓存 | 使用 v-show 缓存已渲染节点 |
| 减少监听 | 合理使用 shallowRef |

### 9.2 节点 ID 重复问题

```js
// 生成唯一 ID
const generateNodeId = (parentId, index) => {
  return `${parentId}-${index}`
}

// 或使用 UUID
import { v4 as uuidv4 } from 'uuid'
const nodeId = uuidv4()
```

### 9.3 树数据响应式问题

```js
// 问题：直接替换 children 不触发更新
const updateTree = () => {
  treeData.value[0].children = newChildren // ❌ 可能不更新
}

// 正确做法：使用响应式方法
const updateTree = () => {
  treeData.value[0].children.splice(0, treeData.value[0].children.length, ...newChildren)
  // 或
  treeData.value = [...treeData.value] // 强制更新
}
```

### 9.4 递归层级过深

```js
// 设置最大渲染层级
const MAX_RENDER_DEPTH = 5

const isOverDepth = computed(() => {
  return props.depth >= MAX_RENDER_DEPTH
})
```

### 9.5 与表格结合使用

树形数据与 el-table 的结合（el-table 支持树形数据）：

```vue
<el-table
  :data="tableData"
  row-key="id"
  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
>
  <el-table-column prop="label" label="名称" />
  <el-table-column prop="status" label="状态" />
</el-table>
```

---

## 10. 参考资料

- [Vue 组件递归](https://v3.cn.vuejs.org/api/global-api.html#provide-inject)
- [element-ui Tree 组件文档](https://element.eleme.cn/#/zh-CN/component/tree)
- [el-tree 源码 (GitHub)](https://github.com/ElemeFE/element/blob/dev/packages/tree/src/node.vue)
- [TreeStore 设计模式](https://design-patterns.readthedocs.io/zh_CN/latest/structural_patterns/composite.html)
- [虚拟滚动原理](https://developers.google.com/web/updates/2016/07/infinite-scroll)

---

*本文档由 Walle 自动生成，参考 element-ui el-tree 源码编写*
