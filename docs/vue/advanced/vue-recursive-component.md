# Vue 递归子组件传值最佳实践

> 递归组件是指在组件模板中调用自身的组件。本文详解递归组件的定义、数据传递方式和最佳实践。

## 目录

1. [什么是递归组件](#1-什么是递归组件)
2. [递归组件的使用场景](#2-递归组件的使用场景)
3. [基本用法](#3-基本用法)
4. [单向数据流与递归](#4-单向数据流与递归)
5. [provide/inject 跨层级传值](#6-provideinject-跨层级传值)
6. [最佳实践](#7-最佳实践)
7. [常见问题](#8-常见问题)

---

## 1. 什么是递归组件

递归组件是指**组件在自己的模板中调用自身**：

```html
<!-- TreeNode.vue -->
<template>
  <div class="tree-node">
    <div class="node-label">{{ node.label }}</div>
    <!-- 递归调用：渲染子节点 -->
    <TreeNode 
      v-for="child in node.children" 
      :key="child.id"
      :node="child" 
    />
  </div>
</template>
```

### 递归组件的必要条件

1. **组件必须要有 `name`**（或通过 `defineOptions` / 文件名推断）
2. **必须要有终止条件**（否则无限递归导致栈溢出）
3. **数据必须能够收敛**（子节点数量/深度有限）

---

## 2. 递归组件的使用场景

| 场景 | 示例 |
|------|------|
| 树形结构 | 文件树、组织架构、分类目录 |
| 评论系统 | 多级嵌套回复 |
| 菜单系统 | 多级导航菜单 |
| 思维导图 | 无限层级的思维导图 |
| 表格 | 树形表格（行展开） |
| Graph 可视化 | 递归图形 |

---

## 3. 基本用法

### 树形组件

```html
<!-- TreeNode.vue -->
<template>
  <div class="tree-node">
    <div class="node-content" @click="toggle">
      <span v-if="hasChildren" class="arrow">{{ isOpen ? '▼' : '▶' }}</span>
      <span class="label">{{ node.label }}</span>
    </div>
    
    <!-- 递归渲染子节点 -->
    <div v-if="isOpen && hasChildren" class="children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :max-depth="maxDepth"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeNode', // 必须有 name 才能递归调用
  
  props: {
    node: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    maxDepth: {
      type: Number,
      default: 10 // 防止无限递归
    },
    defaultOpen: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      isOpen: this.defaultOpen
    }
  },
  
  computed: {
    hasChildren() {
      return this.node.children && this.node.children.length > 0
    }
  },
  
  methods: {
    toggle() {
      if (this.hasChildren) {
        this.isOpen = !this.isOpen
      }
      // 向上传递事件
      this.$emit('node-click', this.node)
    }
  }
}
</script>
```

### 使用树形组件

```html
<template>
  <TreeNode 
    :node="treeData" 
    :default-open="true"
    @node-click="handleNodeClick"
  />
</template>

<script>
import TreeNode from './TreeNode.vue'

export default {
  components: { TreeNode },
  
  data() {
    return {
      treeData: {
        id: 1,
        label: 'Root',
        children: [
          {
            id: 2,
            label: 'Child 1',
            children: [
              { id: 3, label: 'Grandchild 1' },
              { id: 4, label: 'Grandchild 2' }
            ]
          },
          { id: 5, label: 'Child 2' }
        ]
      }
    }
  },
  
  methods: {
    handleNodeClick(node) {
      console.log('Clicked:', node.label)
    }
  }
}
</script>
```

---

## 4. 单向数据流与递归

### Props 向下传递

```html
<!-- 父 → 子 → 孙子：逐层传递 props -->
<TreeNode 
  :node="node"           <!-- 当前节点数据 -->
  :depth="depth + 1"     <!-- 深度递进 -->
  :max-depth="maxDepth" <!-- 最大深度限制 -->
  :selected-id="selectedId" <!-- 全局状态透传 -->
  :config="config"       <!-- 配置对象 -->
/>
```

### Events 向上传递

```html
<!-- 子组件 -->
<template>
  <div @click="handleClick">
    <button @click.stop="$emit('select', node.id)">选择</button>
  </div>
</template>

<script>
export default {
  methods: {
    handleClick() {
      // 冒泡事件 + 当前节点数据
      this.$emit('node-select', {
        id: this.node.id,
        path: [...this.path, this.node.id]
      })
    }
  }
}
</script>
```

### 完整事件流示例

```html
<!-- TreeNode.vue -->
<template>
  <div class="tree-node">
    <div 
      class="node-label" 
      :class="{ selected: node.id === selectedId }"
      @click="$emit('select', node)"
    >
      {{ node.label }}
    </div>
    
    <!-- 递归向下传递，同时向上传递事件 -->
    <TreeNode
      v-for="child in visibleChildren"
      :key="child.id"
      :node="child"
      :selected-id="selectedId"
      :max-depth="maxDepth"
      :depth="depth + 1"
      @select="$emit('select', $event)"
    />
  </div>
</template>
```

---

## 5. provide/inject 跨层级传值

当组件层级较深时，逐层传递 props 会很繁琐。使用 `provide/inject` 可以实现**跨层级传值**：

### 基本用法

```html
<!-- TreeView.vue - 根组件 -->
<template>
  <div class="tree-view">
    <TreeNode :nodes="treeData" />
  </div>
</template>

<script>
import { provide, ref } from 'vue'
import TreeNode from './TreeNode.vue'

export default {
  components: { TreeNode },
  
  setup() {
    // 提供全局状态
    const selectedId = ref(null)
    const expandedIds = ref(new Set())
    
    // 提供方法
    function selectNode(id) {
      selectedId.value = id
    }
    
    function toggleExpand(id) {
      if (expandedIds.value.has(id)) {
        expandedIds.value.delete(id)
      } else {
        expandedIds.value.add(id)
      }
    }
    
    // provide 传递
    provide('tree', {
      selectedId,
      expandedIds,
      selectNode,
      toggleExpand,
      maxDepth: 10
    })
    
    return {}
  }
}
</script>
```

```html
<!-- TreeNode.vue -->
<template>
  <div class="tree-node" :style="{ paddingLeft: `${depth * 16}px` }">
    <div @click="handleClick">
      <span v-if="hasChildren">{{ isExpanded ? '▼' : '▶' }}</span>
      <span :class="{ selected: isSelected }">{{ node.label }}</span>
    </div>
    
    <!-- 无需传递 props，子孙组件直接通过 inject 获取 -->
    <TreeNode
      v-for="child in visibleChildren"
      v-show="isExpanded"
      :key="child.id"
      :nodes="child"
    />
  </div>
</template>

<script>
import { inject, computed } from 'vue'

export default {
  name: 'TreeNode',
  
  props: {
    nodes: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    }
  },
  
  setup(props) {
    // 注入祖先组件提供的数据
    const { selectedId, expandedIds, selectNode, toggleExpand, maxDepth } = inject('tree')
    
    const isSelected = computed(() => selectedId.value === props.nodes.id)
    const isExpanded = computed(() => expandedIds.value.has(props.nodes.id))
    const hasChildren = computed(() => props.nodes.children?.length > 0)
    
    function handleClick() {
      selectNode(props.nodes.id)
      if (hasChildren.value) {
        toggleExpand(props.nodes.id)
      }
    }
    
    return {
      isSelected,
      isExpanded,
      hasChildren,
      handleClick
    }
  }
}
</script>
```

### provide/inject vs Props 对比

| 方式 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| Props 逐层传递 | 层级不深（< 3层） | 显式、数据流清晰 | 繁琐、耦合深 |
| provide/inject | 层级较深 | 简洁、减少耦合 | 隐式、调试困难 |
| Pinia/Vuex | 复杂状态 | 统一管理、调试友好 | 需要额外库 |

---

## 6. 最佳实践

### 6.1 必须设置终止条件

```html
<!-- ❌ 错误：没有终止条件 -->
<template>
  <div>
    {{ node.label }}
    <RecursiveNode :node="node.child" /> <!-- 可能无限递归 -->
  </div>
</template>

<!-- ✅ 正确：检查终止条件 -->
<template>
  <div>
    {{ node.label }}
    <RecursiveNode 
      v-if="node.children?.length" <!-- 终止条件 -->
      :node="node.children[0]" 
    />
  </div>
</template>
```

### 6.2 设置最大深度限制

```js
props: {
  maxDepth: {
    type: Number,
    default: 10
  }
}

watch(() => props.depth, (newDepth) => {
  if (newDepth >= props.maxDepth) {
    console.warn(`超过最大深度 ${props.maxDepth}`)
  }
})
```

### 6.3 使用 key 避免渲染问题

```html
<!-- 必须提供唯一的 :key，否则 Vue 无法正确追踪节点 -->
<TreeNode
  v-for="child in node.children"
  :key="child.id"  <!-- 或 child._uid -->
  :node="child"
/>
```

### 6.4 组合式 API 中的递归

```html
<!-- TreeNode.vue -->
<script setup>
import { computed } from 'vue'

// 在 <script setup> 中，组件自动可用（文件名推断 name）
// 但显式定义更好
defineOptions({
  name: 'TreeNode' // 显式定义 name
})

const props = defineProps({
  node: Object,
  depth: {
    type: Number,
    default: 0
  },
  maxDepth: {
    type: Number,
    default: 10
  }
})

const hasChildren = computed(() => props.node?.children?.length > 0)
const isMaxDepth = computed(() => props.depth >= props.maxDepth)
</script>
```

### 6.5 虚拟滚动优化长列表

```html
<!-- 对于大量节点的树，使用虚拟滚动 -->
<template>
  <RecycleScroller class="tree-scroller">
    <TreeNode
      v-for="node in flattenedNodes"
      :key="node.id"
      :node="node"
    />
  </RecycleScroller>
</template>

<script setup>
import { computed, ref } from 'vue'

const treeData = ref({ /* ... */ })

// 将树展平，配合虚拟滚动
const flattenedNodes = computed(() => {
  const result = []
  function flatten(node, depth) {
    result.push({ ...node, depth })
    if (node.children) {
      node.children.forEach(child => flatten(child, depth + 1))
    }
  }
  flatten(treeData.value, 0)
  return result
})
</script>
```

### 6.6 统一事件接口

```js
// 事件接口统一
this.$emit('tree-select', {
  node: this.node,
  depth: this.depth,
  path: this.getPath() // 从根到当前节点的路径
})

this.$emit('tree-toggle', {
  node: this.node,
  expanded: this.isExpanded
})
```

---

## 7. 常见问题

### Q: 递归组件会导致内存泄漏吗？

**正常情况下不会。** Vue 会正确清理组件实例。但要注意：
- 及时清理组件内的定时器、事件监听器
- 使用 `onBeforeUnmount` 清理资源

### Q: 递归组件如何获取父组件实例？

```js
export default {
  setup(props, { parent }) {
    // 获取父组件实例
    const parentInstance = parent
    
    // 获取根组件
    const root = parent?.root
    
    // 向上遍历
    function findAncestor(name) {
      let current = parent
      while (current) {
        if (current.type.name === name) {
          return current
        }
        current = current.parent
      }
      return null
    }
  }
}
```

### Q: 递归组件如何处理循环引用？

```js
// 数据结构中可能出现 A → B → A 的循环
const treeData = {
  id: 'A',
  children: [{
    id: 'B',
    children: [{ id: 'A' }] // 循环引用
  }]
}

// 方案：记录已访问的节点
export default {
  props: {
    node: Object,
    visitedIds: {
      type: Array,
      default: () => []
    }
  },
  
  computed: {
    safeChildren() {
      return this.node.children?.filter(
        child => !this.visitedIds.includes(child.id)
      ) || []
    }
  }
}
```

### Q: Vue 3 组合式 API 中如何使用递归？

```html
<script setup>
// 组合式 API 中可以直接递归调用（通过文件名推断组件名）
import { computed } from 'vue'

const props = defineProps({
  node: Object,
  depth: {
    type: Number,
    default: 0
  }
})

// 无需额外声明，<script setup> 中的组件模板可以直接使用自身
</script>
```

---

## 参考资料

- [Vue 官方文档 - 递归组件](https://vuejs.org/guide/components/registration.html#recursive-components)
- [Vue 官方文档 - provide/inject](https://vuejs.org/guide/components/provide-inject.html)
- [Vue 3 组合式 API - setup](https://vuejs.org/api/composition-api-setup.html)
