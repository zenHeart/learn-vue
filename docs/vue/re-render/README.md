# Vue 组件重新渲染完全指南

> 理解 Vue 组件何时、为何以及如何重新渲染，是构建高性能应用的关键。

## 目录

[[toc]]

## 一、重新渲染的触发原因

### 1.1 响应式依赖变化

Vue 3 使用 Proxy 实现响应式系统。当响应式数据变化时，组件会自动重新渲染。

```js
// 触发重新渲染的响应式变化
state.count++           // number
state.items.push(...)    // array
state.obj.name = 'new'   // object (必须是响应式的)
state.arr[index] = val   // array (必须通过索引修改)
```

::: warning 常见误区
以下修改**不会**触发响应式更新：

```js
// ❌ 不会触发
state.items.length = 0                   // ❌ 清空数组

// ✅ 正确做法
state.items.splice(0, state.items.length) // ✅ 会触发
```
:::

### 1.2 Props 变化

父组件传递给子组件的 props 变化时，子组件会重新渲染。

```vue
<!-- Parent.vue -->
<Child :items="items" :filter="filter" />
```

- Vue 对 props 进行**浅比较**
- 引用类型 props（对象/数组）即使内容不变，只要引用变化也会触发
- 建议使用 `v-once` 包裹不变的大型数据结构

### 1.3 父组件重新渲染

父组件重新渲染时，其所有子组件也会被强制重新渲染（除非做了优化）。

触发父组件重新渲染的原因：
- 父组件的响应式 state 变化
- 父组件接收到新的 props
- 父组件强制刷新（`forceUpdate`）

::: tip Vue 3 改进
Vue 3 中，子组件的更新是**自动屏蔽**的——如果子组件 props 没变化，子组件不会真正更新到 DOM。但组件实例仍会重新执行 `setup` 逻辑（使用旧的 props 缓存）。
:::

### 1.4 强制刷新（Force Update）

```js
// Vue 3
instance.proxy.$forceUpdate()

// Vue 2
vm.$forceUpdate()
```

### 1.5 异步组件重新挂载

异步组件在某些边界情况下（如 `keep-alive` 切换）会重新挂载。

---

## 二、如何排查重新渲染

### 2.1 Vue DevTools

**Component Inspector** 面板会高亮每次渲染的组件。

1. 安装 Vue DevTools 扩展
2. 打开 DevTools → Components 面板
3. 点击 **Settings** → 开启 **Performance** 相关选项
4. 观察组件旁边的 **render count** 数字

### 2.2 开启 Render Tracing

```js
// Vue 3
const app = createApp(App)
app.config.performance = true

// 在浏览器 DevTools 中使用 Performance 面板
```

### 2.3 Console.log 调试

```js
// 在 render 函数中打印
setup() {
  onBeforeUpdate(() => {
    console.log('组件即将更新:', getCurrentInstance())
  })
  
  onUpdated(() => {
    console.log('组件更新完成')
  })
  
  onRenderTracked((e) => {
    console.log('依赖被追踪:', e)
  })
  
  onRenderTriggered((e) => {
    console.log('触发渲染:', e)
  })
}
```

### 2.4 onRenderTracked vs onRenderTriggered

| 钩子 | 触发时机 | 用途 |
|------|---------|------|
| `onRenderTracked` | 首次 render 时，跟踪所有响应式依赖 | 分析依赖来源 |
| `onRenderTriggered` | 每次重新渲染触发时 | 定位哪个依赖变化 |

```js
onRenderTracked((event) => {
  console.log('依赖追踪:', event.key, event.value)
  // event: { key, newValue, oldValue, target, type }
})

onRenderTriggered((event) => {
  console.log('渲染触发:', event.key, event.newValue)
})
```

### 2.5 手动标记关键点

```js
import { markRaw } from 'vue'

// 大型不可变数据用 markRaw 标记，避免 Proxy 开销
const bigData = markRaw(largeObject)
```

---

## 三、避免不必要的重新渲染

### 3.1 v-memo

缓存模板的子冯iff，当依赖值未变化时跳过子组件的重新渲染。

```vue
<template>
  <!-- count > 10 时才重新渲染 -->
  <SubComponent v-memo="[count > 10]" />
  
  <!-- 多个依赖 -->
  <ListItem v-memo="[user.id, theme]" />
</template>
```

**适用场景：**
- 长列表中的重复项
- 大量相同结构的组件
- 条件性子树

### 3.2 computed

计算属性缓存依赖，只在依赖变化时重新计算。

```js
const doubled = computed(() => count.value * 2)

// 比直接用 method 性能更好
// method 每次调用都会重新计算
```

### 3.3 shallowRef / shallowReactive

| 类型 | 深度 |
|------|------|
| `ref` / `reactive` | 深层响应式 |
| `shallowRef` | 只管 .value 的赋值 |
| `shallowReactive` | 只管第一层 |

```js
// 只有重新赋值 .value 才会触发更新
const state = shallowRef({
  deep: {
    nested: 'value'
  }
})

// 深层修改不会触发更新（性能优化）
state.value.deep.nested = 'new'  // ❌ 不触发
state.value = { deep: { nested: 'new' } }  // ✅ 触发
```

### 3.4 readonly / shallowReadonly

防止意外修改，减少不必要的响应式追踪。

```js
const state = reactive({ count: 0 })
const readOnlyState = readonly(state)

// 外部模块只读访问
```

### 3.5 组件分割策略

| 策略 | 说明 |
|------|------|
| 拆分组件 | 变化频繁的部分拆成独立组件 |
| 稳定组件提取 | 不依赖动态数据的部分用 `v-once` |
| key 管理 | 合理使用 key，避免意外销毁重建 |

### 3.6 v-once

只渲染一次，之后完全跳过。

```vue
<template>
  <div v-once>
    {{ staticContent }}
  </div>
</template>
```

---

## 四、Vue 2 vs Vue 3 重新渲染机制差异

### 4.1 响应式系统

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 实现方式 | Object.defineProperty | Proxy |
| 数组响应式 | 需要覆盖数组方法 | 自动支持 |
| 添加新属性 | 需用 Vue.set | 自动响应 |
| 删除属性 | 需用 Vue.delete | 自动响应 |

### 4.2 渲染触发

| 场景 | Vue 2 | Vue 3 |
|------|-------|-------|
| 组件更新 | 依赖后置（dirty） | 自动依赖收集 |
| 异步更新 | `nextTick` | `nextTick` + scheduler |
| 批量更新 | 自动批处理 | 自动批处理 |
| 父先子后 | 默认行为 | 默认行为（可配置） |

### 4.3 关键区别

**Vue 3 的改进：**
1. **更细粒度的更新**：基本上只有真正使用到的组件才会更新
2. **Composition API**：更灵活的逻辑复用，减少 props 链
3. **Fragment 支持**：减少根元素包裹的性能损耗
4. **Suspense**：原生的异步组件支持

**Vue 2 的限制：**
1. 触发更新时，整个组件树以下都要重新渲染（通过 `vm.$forceUpdate`）
2. 大型列表更新成本高
3. Mixin 的数据来源不清晰

### 4.4 生命周期差异

```
Vue 2 渲染流程:
data change → watcher.update() → queueWatcher() → 
nextTick → flushSchedulerQueue → updated()

Vue 3 渲染流程:
effect re-run → component update → 
async edge scheduling → committed
```

### 4.5 patch 策略

| 场景 | Vue 2 | Vue 3 |
|------|-------|-------|
| 子组件 props 没变 | 仍会重新渲染 | 自动跳过 |
| 静态节点 | 需 v-once | 自动跳过 |
| 列表更新 | 全量 diff | 高效 diff + key |

---

## 五、实战调试演示

打开配套的交互式演示：[re-render-debug.html](./re-render-debug.html)

演示包含：
1. 响应式依赖追踪可视化
2. Props 变化 vs 本地状态变化
3. v-memo vs 普通渲染对比
4. shallowRef vs ref 行为对比
5. render tracing 钩子演示

---

## 六、最佳实践清单

- [ ] 理解响应式依赖，避免意外的大型响应式对象
- [ ] 使用 computed 替代模板中的复杂表达式
- [ ] 长列表使用 v-memo 或虚拟滚动
- [ ] 大型数据用 markRaw / shallowRef 优化
- [ ] 合理拆分组件，避免不必要的全量渲染
- [ ] 调试时使用 onRenderTracked / onRenderTriggered
- [ ] 生产环境关闭 performance API

---

## 相关资源

- [Vue 3 响应式原理](../vue3/reactive-origin.html)
- [Composition API 文档](../vue/composition-api.md)
- [Vue 官方性能指南](https://v3.vuejs.org/guide/performance.html)
