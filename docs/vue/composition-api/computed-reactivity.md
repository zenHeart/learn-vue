# Vue Computed 重复触发刷新问题研究

## 知识点

### 1. Vue Computed 的缓存机制

Vue 3 的 `computed` 使用了**懒加载（lazy）**+**脏值标记（dirty flag）**的缓存机制：

```js
import { ref, computed } from 'vue'

const count = ref(0)

// computed 会缓存结果，只有当依赖变化时才重新计算
const doubled = computed(() => {
  console.log('computing...') // 用于观察是否重新计算
  return count.value * 2
})

console.log(doubled.value) // "computing..." -> 2
console.log(doubled.value) // 不打印 "computing..."，返回缓存的 2
console.log(doubled.value) // 不打印 "computing..."，返回缓存的 2

count.value++              // 标记为 dirty
console.log(doubled.value) // "computing..." -> 4，重新计算并缓存
```

**原理图解：**

```
┌─────────────────────────────────────────────────────────┐
│                    Computed 实例                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   _dirty    │───▶│  _value     │◀───│  effect     │  │
│  │   (Boolean) │    │  (缓存值)   │    │  (计算函数)  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                  ▲                            │
│         ▼                  │                            │
│  ┌─────────────┐    ┌─────────────┐                     │
│  │  依赖追踪   │───▶│  订阅者列表  │                     │
│  │ (dep.keys)  │    │ (subscribers)│                     │
│  └─────────────┘    └─────────────┘                     │
└─────────────────────────────────────────────────────────┘

访问 computed.value 时的流程：
1. _dirty = true? → 重新执行 effect()，更新 _value
2. _dirty = false? → 直接返回 _value（缓存命中）
```

### 2. 为什么深层响应式对象会导致 Computed 重复触发

使用 `reactive()` 创建的对象是**深层响应式**的，任何嵌套属性的变化都会触发依赖追踪：

```js
import { reactive, computed } from 'vue'

const state = reactive({
  user: {
    name: 'Alice',
    age: 25
  }
})

// 问题：这个 computed 依赖整个 user 对象
// 当 user.name 变化时，整个 user 对象被认为是"变化了"
const greeting = computed(() => {
  console.log('greeting computed!')
  return `Hello, ${state.user.name}`
})

// 触发 1 次 greeting computed
state.user.name = 'Bob'

// 再改一次，触发第 2 次
state.user.name = 'Charlie'
```

**深层代理的问题：**

```js
import { reactive, computed } from 'vue'

const obj = reactive({ nested: { value: 1 } })

const computed1 = computed(() => {
  console.log('computed1 triggered')
  return obj.nested.value
})

// 修改深层属性会触发
obj.nested.value = 2 // 触发 computed1

// 直接替换整个 nested 对象也会触发（因为引用变了）
obj.nested = { value: 3 } // 再次触发 computed1
```

### 3. shallowRef vs ref 的选择

| 特性 | `ref` | `shallowRef` |
|------|-------|--------------|
| 深层响应式 | ✅ 是 | ❌ 否（只追踪 .value） |
| 触发更新时机 | 任何深层修改 | 必须替换整个 .value |
| 性能影响 | 高（深层遍历） | 低（只关注顶层） |
| 适用场景 | 需要整体响应式 | 只需要顶层响应式 |

**shallowRef 避免深层追踪：**

```js
import { shallowRef, computed } from 'vue'

// 使用 shallowRef，只追踪 .value 的引用变化
const state = shallowRef({
  items: [1, 2, 3],
  metadata: { title: 'My List' }
})

const summary = computed(() => {
  console.log('summary computed!')
  return `List has ${state.value.items.length} items`
})

// ❌ 不会触发 summary 更新（不是替换 .value）
state.value.items.push(4)           // 不触发
state.value.metadata.title = 'New'  // 不触发

// ✅ 触发 summary 更新（替换 .value）
state.value = {
  items: [1, 2, 3, 4],
  metadata: { title: 'New' }
}
```

**ref 深层追踪：**

```js
import { ref, computed } from 'vue'

// ref 会追踪深层变化
const state = ref({
  items: [1, 2, 3],
  metadata: { title: 'My List' }
})

const summary = computed(() => {
  console.log('summary computed!')
  return `List has ${state.value.items.length} items`
})

// ✅ 触发 summary 更新（ref 深层响应式）
state.value.items.push(4)            // 触发！
state.value.metadata.title = 'New'  // 触发！
```

### 4. markRaw 的使用场景

`markRaw` 标记一个对象为"原始对象"，使其不被代理（不被转换为响应式）：

```js
import { reactive, markRaw } from 'vue'

// largeObject 不需要响应式
const largeObject = markRaw({
  data: new Array(10000).fill(0),
  config: { /* ... */ }
})

const state = reactive({
  // 使用 markRaw 避免深层代理，提升性能
  bigData: largeObject,
  // 普通的响应式数据
  user: { name: 'Alice' }
})
```

**markRaw 的典型场景：**

1. **大型第三方库实例**（如 Leaflet 地图、Chart.js 图表）
2. **不需要响应式的配置对象**
3. **性能优化** - 避免不必要的代理开销

```js
import { reactive, markRaw } from 'vue'
import L from 'leaflet'

const mapConfig = markRaw({
  center: [51.505, -0.09],
  zoom: 13
})

const state = reactive({
  // 地图实例不需要深层响应式追踪
  map: markRaw(new L.Map('map', mapConfig)),
  // 这个才需要响应式
  selectedLayer: null
})

// mapConfig 属性变化不会触发组件更新
mapConfig.zoom = 15

// 替换整个 map 实例才会触发（但这不是我们想要的）
```

### 5. watch vs computed vs watchEffect 触发时机对比

| 特性 | computed | watch | watchEffect |
|------|----------|-------|-------------|
| **用途** | 派生值 | 响应副作用 | 响应副作用 |
| **默认触发** | 懒执行 | 否（需 immediate） | 立即执行 |
| **首次访问** | 计算并缓存 | 不执行（默认） | 执行 |
| **依赖追踪** | 自动 | 手动指定 | 自动 |
| **返回函数** | 否 | stop 函数 | onCleanup 参数 |
| **获取旧值** | ❌ | ✅ | ❌ |
| **适用场景** | 模板中的派生数据 | API 调用、副作用 | 自动追踪依赖 |

```js
import { ref, computed, watch, watchEffect } from 'vue'

const count = ref(0)
const name = ref('Alice')

// computed - 用于模板派生值
const greeting = computed(() => `Hello, ${name.value}`)

// watch - 适合执行副作用，需要旧值
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
  // 适合：API 调用、localStorage 存储
})

// watchEffect - 适合自动追踪多个依赖
watchEffect(() => {
  console.log(`count: ${count.value}, name: ${name.value}`)
  // 适合：日志记录、实时验证
})
```

**触发时机详细对比：**

```js
const num = ref(0)

// computed - 懒执行，只有被访问时才可能触发
const double = computed(() => {
  console.log('computed executed')
  return num.value * 2
})

// watch - 默认不执行初始回调
watch(num, () => {
  console.log('watch triggered')
})

// watchEffect - 立即执行
watchEffect(() => {
  console.log('watchEffect executed')
})

// 初始输出:
// watchEffect executed   ← 立即执行
// （computed 和 watch 都不执行）

num.value = 1
// 输出:
// computed executed      ← 访问时发现 dirty，重新计算
// watch triggered        ← 数值变化触发
// watchEffect executed   ← 依赖变化自动触发
```

### 6. 常见踩坑场景及解决方案

#### 踩坑 1：数组通过 index 修改不触发深层响应式更新

```js
import { reactive } from 'vue'

const list = reactive([1, 2, 3])

// ❌ 这种方式不会触发响应式更新
list[0] = 100

// ✅ 正确方式
list.splice(0, 1, 100)

// ✅ 或者使用 ref + shallowRef
import { shallowRef } from 'vue'
const list = shallowRef([1, 2, 3])
list.value[0] = 100          // 不会触发
list.value = [100, 2, 3]      // 触发（替换整个数组）
```

**原因：** Vue 2/3 的响应式数组通过拦截 `push`、`pop`、`splice` 等方法实现，但直接通过索引赋值不在拦截范围内。

#### 踩坑 2：reactive 对象中替换整个对象 vs 修改属性

```js
import { reactive } from 'vue'

const state = reactive({ user: { name: 'Alice', age: 25 } })

// ✅ 修改属性 - 触发响应式
state.user.name = 'Bob'

// ✅ 替换整个嵌套对象 - 也触发响应式
state.user = { name: 'Charlie', age: 30 }

// ❌ 直接替换顶层 - 不会触发响应式（丢失响应式绑定）
state = reactive({ other: 'data' }) // 不要这样做
```

**最佳实践：使用 ref 处理需要整体替换的场景**

```js
import { ref } from 'vue'

const user = ref({ name: 'Alice', age: 25 })

// 整体替换 - 正常工作
user.value = { name: 'Bob', age: 30 }

// 修改属性 - 也正常工作
user.value.name = 'Charlie'
```

#### 踩坑 3：嵌套对象中某个属性变化导致整个 Computed 重新计算

```js
import { reactive, computed } from 'vue'

const form = reactive({
  basic: { name: '', email: '' },
  advanced: { theme: 'dark', language: 'en' }
})

// 问题：任何嵌套属性变化都会触发
const isValid = computed(() => {
  console.log('isValid recomputed!')
  return form.basic.name.length > 0 && form.basic.email.includes('@')
})

form.advanced.theme = 'light' // ❌ 意外触发 isValid 计算
form.advanced.language = 'zh'  // ❌ 再次意外触发
```

**解决方案 1：使用 toRefs 限制依赖范围**

```js
import { reactive, computed, toRefs } from 'vue'

const form = reactive({
  basic: { name: '', email: '' },
  advanced: { theme: 'dark', language: 'en' }
})

// 只追踪 basic 的属性
const { basic } = toRefs(form)

const isValid = computed(() => {
  console.log('isValid recomputed!')
  return basic.value.name.length > 0 && basic.value.email.includes('@')
})

// 不再触发 isValid（advanced 不在依赖中）
form.advanced.theme = 'light'
```

**解决方案 2：使用 shallowRef**

```js
import { shallowRef, computed } from 'vue'

const form = shallowRef({
  basic: { name: '', email: '' },
  advanced: { theme: 'dark', language: 'en' }
})

// 需要手动触发更新
const isValid = computed(() => {
  console.log('isValid recomputed!')
  return form.value.basic.name.length > 0
})

// 改变 advanced 不触发
form.value.advanced.theme = 'light' // 不触发

// 改变 basic 也不触发（因为是浅响应式）
form.value.basic.name = 'Bob' // 不触发

// 必须替换整个 form.value
form.value = { ...form.value } // 触发
```

#### 踩坑 4：computed 中使用 reactive 对象的常见陷阱

```js
import { reactive, computed } from 'vue'

const state = reactive({
  items: [],
  filter: 'all'
})

// ❌ 陷阱：computed 依赖整个 state.items
const filteredItems = computed(() => {
  if (state.filter === 'all') return state.items
  return state.items.filter(i => i.type === state.filter)
})

// state.filter 变化会触发
// state.items 变化也会触发
// 即使只改了 filter，也可能因为 items 的引用问题多次触发
```

**解决方案：拆分到多个 computed 或使用 watch**

```js
import { reactive, computed } from 'vue'

const state = reactive({
  items: [],
  filter: 'all'
})

// 更好的设计：分开管理
const filter = computed(() => state.filter)
const items = computed(() => state.items)

const filteredItems = computed(() => {
  if (filter.value === 'all') return items.value
  return items.value.filter(i => i.type === filter.value)
})
```

## 原理深入

### Computed 的依赖追踪实现

```js
// computed 内部原理简化实现
class ComputedRefImpl {
  constructor(getter) {
    this._getter = getter
    this._dirty = true        // 初始为 dirty
    this._value = undefined
  }

  get value() {
    if (this._dirty) {
      this._value = this._getter()
      this._dirty = false     // 计算后标记为干净
    }
    return this._value
  }

  // 依赖变化时调用
  notify() {
    this._dirty = true        // 标记为 dirty
  }
}
```

### 响应式依赖收集

```js
// 当访问 reactive 对象的属性时，触发收集
function track(target, key) {
  if (activeEffect) {
    // 将当前 effect 添加到属性的依赖列表
    target[key].dependents.add(activeEffect)
  }
}

// 当修改 reactive 属性时，触发通知
function trigger(target, key) {
  // 通知所有依赖更新
  target[key].dependents.forEach(effect => effect.notify())
}
```

## 最佳实践总结

1. **优先使用 computed** 而不是 watchEffect 来处理派生数据
2. **大型数据结构使用 shallowRef** 避免深层响应式开销
3. **markRaw 用于非响应式对象**（第三方库、大型配置）
4. **避免在 computed 中访问不必要的深层属性** 减少意外触发
5. **需要整体替换时使用 ref**，而不是 reactive
6. **拆分大型 reactive 对象**，只暴露需要的部分

## 常见问题

### Q: computed 和 watch 哪个性能更好？

- computed 有缓存机制，依赖不变时不会重新计算
- watch 每次变化都会执行回调
- 派生值用 computed，副作用用 watch

### Q: 如何避免 computed 重复触发？

1. 使用 `toRefs` 限制依赖范围
2. 使用 `shallowRef` 减少追踪深度
3. 拆分大型 reactive 对象
4. 使用 `markRaw` 排除不需要响应的部分

### Q: reactive 和 ref 如何选择？

- 基本类型 / 需要整体替换的值 → ref
- 复杂对象 / 需要深层响应式 → reactive
- 不想被代理的对象 → markRaw + reactive
