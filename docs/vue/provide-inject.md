# provide-inject

## 核心概念

`provide` / `inject` 是 Vue 中用于 **跨层级组件通信** 的 API，常用于「祖先组件向所有后代组件传递数据」的场景。

### 基本特性

1. **provide 只作为初始数据提供者** — 数据流是单向的（祖先 → 后代）
2. **inject 不要修改提供的状态** — 保持数据流的单向性，避免意外副作用
3. **响应式传递** — provide 的值如果是响应式的，inject 的组件会保持响应

---

## 合并行为（关键问题）

### 结论：Vue provide/inject 不支持自动 merge 操作

当多层组件对同一个 key 调用 `provide()` 时，**子组件的 provide 会覆盖（override）父组件的 provide**，而不是合并（merge）。

### 场景分析

```
Root (provide: { config: { a: 1, b: 2 } })
  └── Child (provide: { config: { b: 3, c: 4 } })
        └── Grandchild (inject: ['config'])
```

**实际结果**：`Grandchild` 拿到的 `config` 是 `{ b: 3, c: 4 }`，父级的 `{ a: 1, b: 2 }` 被完全覆盖。

### 为什么不是 merge？

```js
// 源码简化逻辑（Vue 3）
function provide(key, value) {
  // 当前组件实例的 provides 数组
  let provides = currentInstance.provides
  
  // 如果有父级 provides，基于它创建新的（原型链机制）
  const parentProvides = currentInstance.parent?.provides
  if (parentProvides) {
    provides = Object.create(parentProvides)
  }
  
  // 直接赋值，覆盖而非合并
  provides[key] = value
}
```

Vue 使用 **原型链查找** 而非合并：当查找 `config` 时，先看当前组件的 provides，没有则沿着原型链向上找。

---

## 手动实现 Merge 的方法

如果确实需要「多层 provide 合并」，可以手动实现：

### 方法一：在 provide 中手动合并

```js
// Child.vue
import { inject, provide, toRef } from 'vue'

export default {
  setup() {
    // 获取父级注入
    const parentConfig = inject('config', {})
    
    // 手动合并
    const mergedConfig = {
      ...parentConfig,
      b: 3,  // 子级覆盖
      c: 4   // 子级新增
    }
    
    provide('config', mergedConfig)
  }
}
```

### 方法二：使用 reactive 对象

```js
// Root.vue
import { provide, reactive } from 'vue'

export default {
  setup() {
    const globalState = reactive({
      user: null,
      settings: { theme: 'light' }
    })
    provide('globalState', globalState)
  }
}

// Child.vue（深层后代）
import { inject } from 'vue'

export default {
  setup() {
    const globalState = inject('globalState')
    // 直接修改响应式对象，所有组件都会响应
    globalState.settings.theme = 'dark'
  }
}
```

### 方法三：封装为 composable

```js
// useMergedProvide.js
import { inject, provide, computed } from 'vue'

export function useMergedProvide(key, defaultValue, mergeFn) {
  const parentValue = inject(key, defaultValue)
  const childValue = ref(defaultValue)
  
  const merged = computed(() => mergeFn(parentValue, childValue.value))
  provide(key, merged)
  
  return { value: merged }
}

// 使用
const config = useMergedProvide('config', {}, (parent, child) => ({
  ...parent,
  ...child
}))
```

---

## 常见场景与解决方案

| 场景 | 推荐方案 |
|------|---------|
| 全局配置，层级覆盖 | reactive 对象 + 直接修改 |
| 多层 UI 主题 | provide 多个 key（如 `theme`, `themeOverride`） |
| 插件/库的默认配置 | 使用 `merge` 库手动合并 |
| 跨多层的用户信息 | reactive 单例或 Pinia |

---

## provide/inject 与 reactive 结合

Vue 3 中，推荐使用 `reactive` 的 `provide` 来实现「响应式共享状态」：

```js
// 祖先组件
import { provide, reactive } from 'vue'

setup() {
  const state = reactive({
    count: 0,
    user: { name: 'Alice' }
  })
  provide('appState', state)
  return { state }
}

// 后代组件
import { inject } from 'vue'

setup() {
  const state = inject('appState')
  // state.count++ 会触发所有使用 inject 的组件更新
}
```

**注意**：只有 `reactive` 或 `ref` 的响应式引用才能保持响应式，普通值传递后不再响应。

---

## 常见问题

### Q: 为什么 inject 的值不是响应式的？

A: 如果 provide 传递的不是响应式对象（如普通字符串、对象字面量），则 inject 拿到的只是一个快照，不会响应变化。**解决**：使用 `reactive()` 或 `ref()` 包装。

### Q: 如何让子组件覆盖部分配置而不是全部？

A: 使用上述「手动合并」方法，或使用 reactive 对象直接修改属性。

### Q: provide 可以在普通组件（非祖先组件）中使用吗？

A: 可以。任何组件都可以 provide 数据，只是通常在「根组件」或「高阶组件」中使用，以便所有后代都能访问。

---

## 参考

- [Vue 3 官方文档 - provide/inject](https://vuejs.org/guide/components/provide-inject.html)
- [Vue 3 组合式 API - provide/inject](https://vuejs.org/api/general.html#provide)
