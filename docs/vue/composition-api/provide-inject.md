# Provide/Inject 深入理解

## 概述

`provide/inject` 是 Vue 中用于祖先组件向后代组件传递数据的 API，常用于跨层级组件通信和状态共享场景。

## Vue 2 vs Vue 3 差异

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 引入方式 | 整合适配器 `@vue/composition-api` | 内置支持 |
| API 风格 | 通过 `provide`/`inject` 选项 | 组合式 API `provide()`/`inject()` |
| 响应式 | 仅支持有限响应式 | 完全响应式支持 |
| 注入默认值 | 需配置 `default` 属性 | 支持 `default` 工厂函数 |

### Vue 2 示例

```javascript
// 祖先组件
export default {
  provide: {
    theme: 'dark'
  }
}

// 后代组件
export default {
  inject: ['theme'],
  mounted() {
    console.log(this.theme) // 'dark'
  }
}
```

### Vue 3 示例

```javascript
import { provide, inject } from 'vue'

// 祖先组件
export default {
  setup() {
    provide('theme', 'dark')
  }
}

// 后代组件
export default {
  setup() {
    const theme = inject('theme')
    return { theme }
  }
}
```

## Provide 的合并行为

**重要结论：Vue 的 provide/inject 不支持自动合并。当父子组件提供同名 key 时，后者会覆盖前者。**

### 覆盖行为演示

```javascript
// 祖先组件
provide('config', { name: 'Alice', age: 30 })

// 子组件（覆盖）
provide('config', { name: 'Bob' })

// 孙组件获取到的 config
// { name: 'Bob' } — 祖先的 age 属性丢失
```

### 与 Props 的对比

Props 支持合并策略（默认合并、替换合并等），但 provide/inject 不具备此机制：

```javascript
// Props 合并行为 — 子组件的 props 会与父组件的 props 合并
// 定义了 inheritAttrs: false 等可控制合并行为

// Provide 无合并机制 — 纯粹覆盖
provide('key', childValue) // 直接替换父级提供的值
```

## 如何实现类似 Props 的合并策略

### 方案一：手动合并

在 provide 时检查并合并现有值：

```javascript
import { inject, provide, computed } from 'vue'

// 创建共享状态
const createSharedState = (key, initialValue) => {
  const parentValue = inject(key, {})
  const mergedValue = { ...parentValue, ...initialValue }
  provide(key, mergedValue)
  return mergedValue
}

// 使用
provide('config', { name: 'Alice', age: 30 })
// 子组件中
createSharedState('config', { age: 25, gender: 'female' })
// 结果: { name: 'Alice', age: 25, gender: 'female' }
```

### 方案二：使用 reactive 对象

将 provide 的值包装为响应式对象，利用 Vue 的响应式系统实现自动同步：

```javascript
import { reactive, provide, inject } from 'vue'

// 祖先组件
const sharedState = reactive({
  name: 'Alice',
  age: 30
})
provide('sharedState', sharedState)

// 后代组件
const sharedState = inject('sharedState')
// 修改会影响所有组件
sharedState.age = 25
```

### 方案三：使用 computed 实现只读合并

```javascript
import { computed, provide, inject } from 'vue'

// 祖先
const baseConfig = { apiUrl: 'https://api.example.com' }
provide('config', baseConfig)

// 子组件扩展配置
const parentConfig = inject('config')
const extendedConfig = computed(() => ({
  ...parentConfig,
  timeout: 5000
}))
provide('config', extendedConfig.value)
```

## 最佳实践

### 1. 使用 Symbol 作为注入 key

避免命名冲突：

```javascript
// injectionKey.js
import { InjectionKey } from 'vue'
export const CONFIG_KEY = Symbol('appConfig')
export const USER_INFO_KEY = Symbol('userInfo')

// 使用
provide(CONFIG_KEY, config)
const config = inject(CONFIG_KEY)
```

### 2. 提供默认值

```javascript
const config = inject('config', { defaultValue: 'fallback' })

// 对于对象类型，使用工厂函数
const state = inject('state', () => reactive({ count: 0 }))
```

### 3. 响应式注入

使用 `toRef` 或 `toRefs` 保持响应性：

```javascript
import { toRef } from 'vue'

const state = inject('state')
// 如果 state 是响应式的，保持引用
```

### 4. 替代方案：Store 模式

对于需要合并和状态管理的场景，使用 Pinia 或自定义 store：

```javascript
// store/useConfig.js
import { reactive, readonly } from 'vue'

const state = reactive({
  base: {},
  extended: {}
})

export function useConfig() {
  function extendConfig(partial) {
    Object.assign(state.extended, partial)
  }

  function getMergedConfig() {
    return { ...state.base, ...state.extended }
  }

  return {
    config: readonly(state),
    extendConfig,
    getMergedConfig
  }
}
```

## 常见问题

### Q: 为什么 provide 的值没有自动合并？

A: Vue 的响应式系统基于引用链，provide/inject 设计为直接传递引用。合并会增加复杂性且容易产生意外副作用。如需合并，建议使用 reactive 对象或手动合并。

### Q: 如何调试 provide/inject？

A:
1. 在 Vue DevTools 中查看 Components -> injects
2. 使用 `console.log(inject('key'))` 检查注入值
3. 确保 key 类型一致（string vs Symbol）

### Q: provide 可以传递响应式数据吗？

A: 可以。provide 本身不处理响应式，传递的对象是否响应式取决于你传入的内容：

```javascript
provide('reactive', reactive({ count: 0 }))  // 响应式
provide('static', { count: 0 })              // 非响应式
```

## 总结

Vue 的 provide/inject 采用**覆盖策略**而非合并策略。实现类似 props 的合并效果有以下方式：

1. **手动合并**：提供新值前与现有值合并
2. **Reactive 对象**：利用 Vue 响应式系统
3. **Store 模式**：使用集中式状态管理（Pinia）
4. **Composition API 封装**：创建可复用的组合式函数

选择方案时，需根据实际场景权衡复杂度与维护性。