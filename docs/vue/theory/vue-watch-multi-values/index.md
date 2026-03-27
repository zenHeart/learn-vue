# Vue watch 监听多个值的处理策略

## 目录

1. [概述](#1-概述)
2. [Vue 3 监听多个值](#2-vue-3-监听多个值)
3. [Vue 2 监听多个值](#3-vue-2-监听多个值)
4. [常见场景与最佳实践](#4-常见场景与最佳实践)
5. [性能优化](#5-性能优化)
6. [常见问题](#6-常见问题)

---

## 1. 概述

### 1.1 为什么需要监听多个值？

在实际开发中，经常会遇到需要根据多个响应式数据的变化来执行相应逻辑的场景：

- 表单验证：同时监听多个字段
- 搜索功能：同时监听搜索词和筛选条件
- 权限控制：同时监听多个角色状态
- 数据联动：多个数据源共同决定显示内容

### 1.2 Vue watch 的基本概念

```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)

// 基本用法：监听单个值
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})
</script>
```

---

## 2. Vue 3 监听多个值

### 2.1 使用数组同时监听多个数据源

```vue
<script setup>
import { ref, watch } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')
const age = ref(25)

// 同时监听多个值
watch(
  [firstName, lastName, age],
  ([newFirst, newLast, newAge], [oldFirst, oldLast, oldAge]) => {
    console.log(`Name changed: ${oldFirst} ${oldLast} -> ${newFirst} ${newAge}`)
    console.log(`Age changed: ${oldAge} -> ${newAge}`)
  },
  { immediate: true }
)
</script>
```

### 2.2 数组监听的回调函数参数

| 参数位置 | 说明 |
|---------|------|
| `newValues[index]` | 第 index 个数据源的新值 |
| `oldValues[index]` | 第 index 个数据源的原值 |

```vue
<script setup>
import { ref, watch } from 'vue'

const a = ref(1)
const b = ref(2)

watch(
  [a, b],
  ([newA, newB], [oldA, oldB]) => {
    console.log(`a: ${oldA} -> ${newA}`)
    console.log(`b: ${oldB} -> ${newB}`)
  }
)
</script>
```

### 2.3 使用 getter 函数监听计算值

```vue
<script setup>
import { ref, computed, watch } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 使用 computed 作为 getter
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

watch(
  fullName,
  (newName, oldName) => {
    console.log(`Full name: ${oldName} -> ${newName}`)
  }
)
</script>
```

### 2.4 深度监听多个嵌套对象

```vue
<script setup>
import { ref, watch } from 'vue'

const user = ref({
  profile: {
    name: 'John',
    age: 25
  },
  settings: {
    theme: 'dark',
    language: 'en'
  }
})

// 深度监听（需要 deep: true）
watch(
  () => [user.value.profile, user.value.settings],
  ([newProfile, newSettings], [oldProfile, oldSettings]) => {
    console.log('Profile changed:', oldProfile, '->', newProfile)
    console.log('Settings changed:', oldSettings, '->', newSettings)
  },
  { deep: true }
)
</script>
```

### 2.5 watchEffect 监听多个值

`watchEffect` 自动追踪所有响应式依赖：

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const a = ref(1)
const b = ref(2)
const c = ref(3)

watchEffect(() => {
  // 自动追踪 a, b 的变化
  console.log(`a = ${a.value}, b = ${b.value}`)
  // 不会追踪 c 的变化（未在 effect 中使用）
})
</script>
```

---

## 3. Vue 2 监听多个值

### 3.1 使用数组语法

```js
export default {
  data() {
    return {
      firstName: 'John',
      lastName: 'Doe',
      age: 25
    }
  },
  watch: {
    // 监听多个属性（Vue 2 的标准做法）
    firstName: 'handleNameChange',
    lastName: 'handleNameChange',
    age: 'handleNameChange'
  },
  methods: {
    handleNameChange() {
      console.log('Name or age changed')
    }
  }
}
```

### 3.2 使用 computed 属性结合 watch

```js
export default {
  data() {
    return {
      firstName: 'John',
      lastName: 'Doe'
    }
  },
  computed: {
    fullName() {
      return `${this.firstName} ${this.lastName}`
    }
  },
  watch: {
    // 监听 computed 属性
    fullName(newVal, oldVal) {
      console.log(`Full name changed: ${oldVal} -> ${newVal}`)
    }
  }
}
```

### 3.3 $watch 监听多个值

```js
export default {
  mounted() {
    this.$watch(
      () => [this.firstName, this.lastName],
      ([newFirst, newLast], [oldFirst, oldLast]) => {
        console.log(`Changed: ${oldFirst} ${oldLast} -> ${newFirst} ${newLast}`)
      },
      { immediate: true, deep: true }
    )
  }
}
```

---

## 4. 常见场景与最佳实践

### 4.1 表单验证场景

```vue
<script setup>
import { ref, watch, computed } from 'vue'

const form = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = ref({})

// 监听所有字段
watch(
  () => [form.value.email, form.value.password, form.value.confirmPassword],
  ([newEmail, newPwd, newConfirm], [oldEmail, oldPwd, oldConfirm]) => {
    errors.value = {}

    if (newEmail && !isValidEmail(newEmail)) {
      errors.value.email = 'Invalid email format'
    }
    if (newPwd && newPwd.length < 8) {
      errors.value.password = 'Password too short'
    }
    if (newConfirm && newPwd !== newConfirm) {
      errors.value.confirmPassword = 'Passwords do not match'
    }
  }
)

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
</script>
```

### 4.2 搜索与筛选场景

```vue
<script setup>
import { ref, watch, debounce } from 'vue'

const searchQuery = ref('')
const category = ref('all')
const sortBy = ref('relevance')
const isLoading = ref(false)

// 监听所有筛选条件
watch(
  [searchQuery, category, sortBy],
  debounce(([newQuery, newCat, newSort], [oldQuery, oldCat, oldSort]) => {
    if (newQuery !== oldQuery || newCat !== oldCat || newSort !== oldSort) {
      performSearch()
    }
  }, 300)
)

async function performSearch() {
  isLoading.value = true
  // 执行搜索
  isLoading.value = false
}
</script>
```

### 4.3 权限控制场景

```vue
<script setup>
import { ref, watch, computed } from 'vue'

const userRoles = ref(['viewer'])
const userPermissions = ref(['read'])
const resourceOwner = ref('user123')

const canEdit = computed(() => {
  return userRoles.value.includes('admin') ||
         userRoles.value.includes('editor') ||
         (resourceOwner.value === currentUserId.value && userPermissions.value.includes('write'))
})

watch(
  [userRoles, userPermissions, resourceOwner],
  () => {
    updateResourceAccess()
  }
)
</script>
```

---

## 5. 性能优化

### 5.1 避免不必要的监听

**❌ 不推荐：**
```vue
<script setup>
// 每次渲染都创建新数组
watch(
  () => [obj.a, obj.b, obj.c],
  () => { /* ... */ }
)
</script>
```

**✅ 推荐：**
```vue
<script setup>
// 使用 computed 缓存依赖
const deps = computed(() => ({
  a: obj.a,
  b: obj.b,
  c: obj.c
}))

watch(
  deps,
  () => { /* ... */ },
  { deep: true }
)
</script>
```

### 5.2 合理使用 immediate

```vue
<script setup>
import { ref, watch } from 'vue'

const data = ref(null)

// 只需要初始化时执行
watch(
  data,
  (newVal) => {
    console.log('Data initialized:', newVal)
  },
  { immediate: true }
)

// 需要检测变化
watch(
  () => data.value?.id,
  (newId) => {
    if (newId) fetchDetails(newId)
  }
)
</script>
```

### 5.3 使用 watchPostEffect 和 watchSyncEffect

```vue
<script setup>
import { ref, watchPostEffect, watchSyncEffect } from 'vue'

const count = ref(0)

// DOM 更新后执行（适用于访问更新后的 DOM）
watchPostEffect(() => {
  console.log('DOM updated:', count.value)
})

// 同步执行（谨慎使用，可能影响性能）
watchSyncEffect(() => {
  console.log('Synchronous:', count.value)
})
</script>
```

---

## 6. 常见问题

### 6.1 监听数组中对象的变化

```vue
<script setup>
import { ref, watch } from 'vue'

const items = ref([
  { id: 1, name: 'A' },
  { id: 2, name: 'B' }
])

// ❌ 错误：直接监听 items
watch(items, () => console.log('changed'))

// ✅ 正确：使用 getter 函数
watch(
  () => items.value.map(item => item.id),
  (newIds, oldIds) => console.log('items changed')
)

// ✅ 正确：深度监听（但可能有性能问题）
watch(
  () => items.value,
  () => console.log('changed'),
  { deep: true }
)
</script>
```

### 6.2 监听对象属性变化但不触发

```vue
<script setup>
import { ref, watch } from 'vue'

const obj = ref({ a: 1 })

// ❌ 不工作：obj.value.a 变化不会触发
watch(() => obj.value.a, (newVal) => console.log(newVal))

// ✅ 正确：使用 getter
watch(
  () => ({ ...obj.value }),
  (newObj) => console.log(newObj)
)

// ✅ 正确：同时监听多个值
watch(
  () => [obj.value.a, obj.value.b],
  ([a, b]) => console.log(a, b)
)
</script>
```

### 6.3 取消 watch 监听

```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)

const stopWatch = watch(count, (newVal) => {
  console.log(newVal)
  if (newVal >= 10) {
    stopWatch() // 取消监听
  }
})
</script>
```

---

## 总结

| 场景 | 推荐方案 |
|------|---------|
| 监听多个独立值 | `watch([val1, val2, ...], ...)` |
| 监听计算结果 | `watch(computed, ...)` |
| 监听嵌套对象 | `watch(() => ({ ...obj }), ..., { deep: true })` |
| 初始化时执行 | `watch(..., { immediate: true })` |
| 取消监听 | 调用 `watch` 返回的停止函数 |

---

## 参考资料

- [Vue 3 响应性 API](https://vuejs.org/api/reactivity-core.html#watch)
- [Vue 3 侦听器深度指南](https://vuejs.org/guide/essentials/watchers.html)
- [Vue 2 侦听器](https://v2.vuejs.org/v2/guide/computed.html#Watchers)
