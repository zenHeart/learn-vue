# Vue 3 TypeScript 常见报错及解决方案

> 本文档整理 Vue 3 + TypeScript 开发中常见的 TypeScript 报错，提供原因分析和解决方案

## 目录

1. [Type 'unknown' is not assignable to type 'xxx'](#1-type-unknown-is-not-assignable-to-type-xxx)
2. [Property does not exist on type](#2-property-does-not-exist-on-type)
3. [Cannot find module or its corresponding type declarations](#3-cannot-find-module-or-its-corresponding-type-declarations)
4. [Module has no exported member](#4-module-has-no-exported-member)
5. [Props 类型推断问题](#5-props-类型推断问题)
6. [Volar 工具链配置问题](#6-volar-工具链配置问题)
7. [模板 ref 类型错误](#7-模板-ref-类型错误)
8. [watch/watchEffect 回调类型错误](#8-watchwatcheffect-回调类型错误)

---

## 1. Type 'unknown' is not assignable to type 'xxx'

### 问题描述

使用 `reactive` 或 `ref` 时，TypeScript 推断出的类型是 `unknown`，无法赋值给具体类型。

### 原因分析

Vue 3 的 `reactive` 和 `ref` 会根据初始值自动推断类型。如果初始值为空（如 `ref(null)`），TypeScript 会推断为 `unknown`。

```ts
// ❌ 错误示例
const data = ref(null) // 推断为 Ref<null>
data.value = 'hello'   // TS2345: Argument of type 'string' is not assignable

// ❌ 错误示例
const state = reactive({}) // 推断为 Reactive<{}>
state.name = 'Tom'         // TS2339: Property 'name' does not exist
```

### 解决方案

显式声明泛型参数：

```ts
// ✅ 使用泛型声明具体类型
const data = ref<string | null>(null)
data.value = 'hello' // 正常

// ✅ reactive 使用泛型
const state = reactive<{ name: string; age: number }>({ name: 'Tom', age: 20 })

// ✅ 更简洁的方式：提供初始值
const data = ref('hello')        // 推断为 Ref<string>
const list = ref<string[]>([])   // 显式声明数组类型
```

### 延伸：reactive 初始化

```ts
// ❌ 初始为空对象
const state = reactive({})

// ✅ 正确做法：声明类型或提供初始值
interface User {
  name: string
  age: number
}

const state = reactive<User>({
  name: 'Tom',
  age: 20
})
```

---

## 2. Property does not exist on type

### 问题描述

模板中使用的变量或属性被 TypeScript 报错"属性不存在"。

### 原因分析

通常是 `shims-vue.d.ts` 配置缺失或不完整，导致 `.vue` 文件没有被正确识别为模块。

### 解决方案

确保项目根目录有 `shims-vue.d.ts` 文件：

```ts
// shims-vue.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

或者使用 Vue 3 的新写法（推荐）：

```ts
// shims-vue.d.ts
declare module '*.vue' {
  import type { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}
```

如果使用了 `<script setup>`，还需要引入类型：

```ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}
```

---

## 3. Cannot find module or its corresponding type declarations

### 问题描述

导入 `.vue` 文件或某个模块时，TypeScript 报错找不到类型声明。

### 原因分析

1. `tsconfig.json` 未包含 `.vue` 文件
2. `paths` 或 `baseUrl` 配置问题
3. 模块的 `@types` 包未安装

### 解决方案

**方案一：配置 tsconfig.json**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"]
  }
}
```

**方案二：安装类型定义**

```bash
npm install -D @types/node
```

**方案三：检查 .vue 导入**

```ts
// ❌ 可能报错
import MyComponent from './MyComponent.vue'

// ✅ 确保 .vue 后缀正确
import MyComponent from './MyComponent.vue'
```

---

## 4. Module has no exported member

### 问题描述

从 `vue` 导入时报错"模块没有导出该成员"。

### 原因分析

Vue 3 与 Vue 2 的导出结构不同，或者导入的 API 在 Vue 3 中已移除/重命名。

### 解决方案

**Vue 2 → Vue 3 常见变更：**

```ts
// ❌ Vue 2 写法
import { some, thing } from 'vue'

// ✅ Vue 3 正确写法
import { ref, reactive, computed, watch } from 'vue'
```

**常用 Vue 3 API 导入：**

```ts
import {
  ref,           // 创建响应式引用
  reactive,      // 创建响应式对象
  computed,      // 创建计算属性
  watch,         // 监听响应式数据
  watchEffect,   // 立即执行的监听
  toRefs,        // 将 reactive 转 ref
  toRef,         // 创建对属性的 ref
  onMounted,     // 生命周期钩子
  onUnmounted,
  nextTick,      // 异步更新后执行
  defineComponent,
  defineProps,
  defineEmits,
  h,             // 渲染函数
  Fragment,
  Teleport,
  Suspense
} from 'vue'
```

**类型导入（Vue 3.3+）：**

```ts
// ✅ 使用具体类型
import type { Ref, ComputedRef, PropType } from 'vue'

const count: Ref<number> = ref(0)
const name: ComputedRef<string> = computed(() => 'hello')
```

---

## 5. Props 类型推断问题

### 问题描述

使用 `defineProps` 时，TypeScript 无法正确推断 props 类型，或报错类型不匹配。

### 原因分析

Vue 3 的 `defineProps` 有两种语法，类型推断能力不同：

```ts
// ❌ 基于类型的声明可能推断不准确
const props = defineProps({
  name: String,
  age: Number
})
// props.name 可能是 undefined

// ❌ 未使用 withDefaults 时默认值不生效
const props = defineProps<{
  name: string
  count?: number
}>()
```

### 解决方案

**方案一：使用泛型 + withDefaults（Vue 3.3+）**

```ts
// ✅ 推荐写法
const props = withDefaults(defineProps<{
  name: string
  count?: number
  items?: string[]
}>(), {
  count: 0,
  items: () => []
})
```

**方案二：使用 PropType 辅助类型**

```ts
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    type: {
      type: String as PropType<'success' | 'warning' | 'error'>,
      default: 'success'
    },
    callback: {
      type: Function as PropType<() => void>
    }
  }
})
```

**方案三：Vue 3.4+ 简化写法**

```ts
// 直接使用 const 声明
const props = defineProps<{
  name: string
  age?: number
}>()

// age 在这里可能是 undefined
// 需要结合 withDefaults 或在使用处做判断
console.log(props.age ?? 0)
```

---

## 6. Volar 工具链配置问题

### 问题描述

Volar 插件报错、类型提示失效、或 `vue-tsc` 报错。

### 原因分析

1. Volar 版本过旧，与 Vue 3.4+ 不兼容
2. `vue-tsc` 版本不匹配
3. VS Code 中 Volar 扩展冲突

### 解决方案

**步骤一：升级 Volar**

在 VS Code 中更新 "Vue - Official" 扩展，或卸载旧版 Volar。

**步骤二：安装 vue-tsc**

```bash
npm install -D vue-tsc
```

**步骤三：配置 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**步骤四：在 package.json 添加类型检查脚本**

```json
{
  "scripts": {
    "type-check": "vue-tsc --noEmit"
  }
}
```

---

## 7. 模板 ref 类型错误

### 问题描述

使用模板 ref 时，TypeScript 报错"类型 unknown"或"属性不存在"。

### 原因分析

模板 ref 需要显式声明组件实例类型，否则 TypeScript 无法推断。

```ts
// ❌ 没有声明类型
const myRef = ref(null)
```

### 解决方案

**获取 DOM 元素：**

```ts
// ✅ 指定具体 DOM 类型
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  inputRef.value?.focus()
})
```

**获取子组件实例：**

```ts
// ✅ 使用 InstanceType 获取组件类型
import ChildComponent from './ChildComponent.vue'

const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

// 调用子组件暴露的方法
childRef.value?.someMethod()
```

**子组件需要暴露方法：**

```vue
<!-- ChildComponent.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

// ✅ 使用 defineExpose 暴露方法
defineExpose({
  count,
  increment
})
</script>
```

**类型安全的 defineExpose（Vue 3.5+）：**

```ts
// 显示声明暴露的类型
interface Exposed {
  count: number
  increment: () => void
}

const count = ref(0)
const increment = () => count.value++

defineExpose<Exposed>({
  count,
  increment
})
```

---

## 8. watch/watchEffect 回调类型错误

### 问题描述

`watch` 或 `watchEffect` 的回调函数中，TypeScript 报错类型不匹配。

### 原因分析

watch 的回调签名的类型推断可能不准确，特别是在涉及多个数据源时。

```ts
// ❌ 多个源时类型不明确
watch([refA, refB], (newValues) => {
  // newValues 类型可能是 unknown[]
})
```

### 解决方案

**方案一：显式声明回调参数类型**

```ts
import type { Ref } from 'vue'

const count = ref(0)

// ✅ 显式声明 newValue 和 oldValue 类型
watch(count, (newValue: number, oldValue: number) => {
  console.log(`count changed: ${oldValue} -> ${newValue}`)
})
```

**方案二：元组形式多个源**

```ts
// ✅ 使用数组解构，明确每个源的类型
watch(
  [count, name],
  ([newCount, newName], [oldCount, oldName]) => {
    console.log(`count: ${oldCount} -> ${newCount}`)
    console.log(`name: ${oldName} -> ${newName}`)
  }
)
```

**方案三：watchEffect 类型**

```ts
// ✅ watchEffect 自动推断
const count = ref(0)
watchEffect(() => {
  // 这里 TypeScript 自动知道 count 是 number
  console.log(count.value * 2)
})
```

**方案四：深度监听对象**

```ts
// ✅ 使用泛型指定对象类型
const user = reactive({
  name: 'Tom',
  age: 20
})

watch(
  user,
  (newUser, oldUser) => {
    // newUser 和 oldUser 类型正确
    console.log(newUser.name)
  },
  { deep: true }
)
```

---

## 附录：常用 tsconfig.json 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

---

## 更多资料

- [Vue 3 官方类型文档](https://vuejs.org/guide/typescript/overview.html)
- [Vue 3.4 Props 类型推断](https://blog.vuejs.org/posts/vue-3-4)
- [Volar 官方文档](https://vuejs.org/guide/typescript/overview.html#ide-support)
