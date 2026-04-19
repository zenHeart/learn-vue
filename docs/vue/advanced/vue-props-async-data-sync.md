# Vue 组件异步数据同步指南

## 问题描述

Vue 组件基于父组件传入数据创建 data 时，异步情况下子组件数据同步问题。

## 核心概念

### 1. props 与 data 的关系

子组件通过 props 接收父组件数据，然后在 `data()` 中基于这些 props 创建本地状态：

```javascript
export default {
  props: ['initialData'],
  data() {
    return {
      // 基于 props 创建本地 data
      localData: this.initialData
    }
  }
}
```

### 2. 异步场景下的同步问题

当 props 是异步获取时，会出现以下问题：

```javascript
// 父组件
export default {
  data() {
    return {
      items: [] // 初始为空
    }
  },
  async mounted() {
    this.items = await fetchItems() // 异步获取
  }
}
```

**问题**：子组件可能在 props 变化时无法正确同步本地 data。

### 3. Vue 3 的响应式更新

Vue 3 中，props 变化会触发组件更新，但 `data()` 只在组件创建时调用一次。

```javascript
// Vue 3 组件
export default {
  props: ['initialData'],
  data() {
    return {
      localData: this.initialData
    }
  },
  // 使用 watch 监听 props 变化
  watch: {
    initialData(newVal) {
      this.localData = newVal
    }
  }
}
```

## 解决方案

### 方案一：使用 watch 监听 props

```javascript
export default {
  props: ['initialData'],
  data() {
    return {
      localData: null
    }
  },
  watch: {
    initialData: {
      handler(newVal) {
        this.localData = newVal
      },
      immediate: true // 立即执行，确保初始值也被处理
    }
  }
}
```

### 方案二：使用 computed

```javascript
export default {
  props: ['initialData'],
  computed: {
    // 直接基于 props 计算
    localData() {
      return this.initialData
    }
  }
}
```

### 方案三：使用 Vue 3 的 `defineProps` + `watchEffect`

```javascript
import { watchEffect } from 'vue'

export default {
  setup(props) {
    const localData = ref(null)
    
    watchEffect(() => {
      localData.value = props.initialData
    })
    
    return { localData }
  }
}
```

## 最佳实践

1. **避免在 data() 中直接使用异步 props**
2. **使用 watch 或 watchEffect 监听 props 变化**
3. **使用 computed 当需要派生状态时**
4. **考虑使用 v-if 条件渲染，确保数据加载完成后再渲染子组件**

## 示例代码

### 父组件

```vue
<template>
  <ChildComponent :items="items" />
</template>

<script>
export default {
  data() {
    return {
      items: []
    }
  },
  async mounted() {
    this.items = await fetchItems()
  }
}
</script>
```

### 子组件

```vue
<template>
  <div v-if="localItems">
    <!-- 渲染逻辑 -->
  </div>
</template>

<script>
export default {
  props: ['items'],
  data() {
    return {
      localItems: null
    }
  },
  watch: {
    items: {
      handler(newItems) {
        this.localItems = newItems
      },
      immediate: true
    }
  }
}
</script>
```

## 注意事项

1. **时序问题**：确保在 `mounted` 钩子中获取数据后再传递给子组件
2. **空值处理**：使用 `v-if` 或可选链 `?.` 处理可能的空值
3. **性能考虑**：避免不必要的深度监听，使用 `deep: false`（Vue 2）

## 相关文档

- [Vue 响应式原理](../theory/vue-reactivity.md)
- [Vue 生命周期](../theory/vue-lifecycle.md)
- [Vue Watch 管理](../advanced/vue-watch-manage.md)
