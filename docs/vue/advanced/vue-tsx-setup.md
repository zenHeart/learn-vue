# Vue 3 TSX 完全指南：setup 组合式 API 与 TSX 渲染

## 目录

1. [为什么用 TSX？](#为什么用-tsx)
2. [环境配置](#环境配置)
3. [setup 返回 TSX 的写法](#setup-返回-tsx-的写法)
4. [setup 返回 render 函数（h()）](#setup-返回-render-函数h)
5. [template 中使用 TSX 组件](#template-中使用-tsx-组件)
6. [render 函数 vs template](#render-函数-vs-template)
7. [Vue 3 TSX 语法细节](#vue-3-tsx-语法细节)
8. [常见问题](#常见问题)

---

## 为什么用 TSX？

Vue 3 同时支持三种模板定义方式：

| 方式 | 语法 | 编译 | 适用场景 |
|------|------|------|----------|
| template | Vue SFC `<template>` | template compiler | 大部分业务组件，推荐 |
| render 函数 | `h()` + JS 对象 | 无需编译 | 动态渲染、程序化组件 |
| TSX/JSX | JSX/TSX 语法 | @vitejs/plugin-vue-jsx | 需要类型推导的复杂组件 |

**TSX 的核心优势**：
- ✅ 完整的 TypeScript 类型推导（props、emit、slots）
- ✅ 逻辑复用更灵活（可与 Composition API 无缝结合）
- ✅ 适合动态渲染逻辑复杂的组件
- ⚠️ 需要额外配置
- ⚠️ 不支持模板指令（v-if/v-for/v-model 需换写法）

---

## 环境配置

### 1. 安装依赖

```bash
npm install @vitejs/plugin-vue-jsx -D
```

> 依赖版本：`@vitejs/plugin-vue-jsx@^4.x` 对应 Vue 3.5+；`^3.x` 对应 Vue 3.2-3.4。

### 2. vite.config.ts 配置

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx({
      // 是否启用 JSX 变换（默认 true）
      transformOn: true,
      // 合并 props 而非覆盖（默认 true）
      mergeProps: true,
      // 是否启用自定义 directives（默认 true）
      customDirectives: true,
      // 导出 JSX runtime 形式：'automatic' | 'classic'
      // 'automatic': 自动导入，无需手动 import h
      // 'classic': 需要手动 import h
      jsxImportSource: 'vue',
    })
  ]
})
```

### 3. tsconfig.json 配置

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

> **注意**：`"jsx": "preserve"` 是必需的，它告诉 TypeScript 不要处理 JSX 文件，由 vite 插件接管。

### 4. 目录约定

```
src/
├── components/       # Vue SFC 组件
├── tsx/             # TSX 组件（.tsx 文件）
│   ├── Button.tsx
│   └── Modal.tsx
```

TSX 文件必须使用 `.tsx` 扩展名，与 `.vue` 文件区分。

---

## setup 返回 TSX 的写法

### 基础模式：setup + 返回 JSX

```tsx
// tsx/HelloWorld.tsx
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'HelloWorld',
  props: {
    name: {
      type: String,
      default: 'World'
    }
  },
  setup(props) {
    const count = ref(0)

    return () => (
      <div class="hello">
        <h1>Hello {props.name}</h1>
        <p>计数：{count.value}</p>
        <button onClick={() => count.value++}>+1</button>
      </div>
    )
  }
})
```

### setup 返回 TSX 的完整示例（含 emit、slots）

```tsx
// tsx/FeatureCard.tsx
import { defineComponent, ref, useSlots } from 'vue'

export default defineComponent({
  name: 'FeatureCard',
  // props 类型自动推导，无需单独声明
  props: {
    title: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:count', 'delete'],
  setup(props, { emit, slots }) {
    const slots_data = useSlots()
    const localCount = ref(props.count)

    const handleIncrement = () => {
      localCount.value++
      emit('update:count', localCount.value)
    }

    const handleDelete = () => {
      emit('delete')
    }

    return () => (
      <div class="feature-card">
        <div class="header">
          <h3>{props.title}</h3>
          <span class="badge">{localCount.value}</span>
        </div>

        <div class="content">
          {/* 默认插槽 */}
          {slots.default?.()}
          {/* 命名插槽 */}
          {slots.footer?.()}
        </div>

        <div class="actions">
          <button onClick={handleIncrement}>增加</button>
          <button onClick={handleDelete} class="danger">删除</button>
        </div>
      </div>
    )
  }
})
```

**使用方式**：

```vue
<!-- App.vue (SFC) -->
<script setup lang="tsx">
import FeatureCard from './tsx/FeatureCard.tsx'
</script>

<template>
  <FeatureCard title="特性" :count="10" @update:count="val => console.log(val)">
    <template #default>
      <p>这是卡片内容</p>
    </template>
    <template #footer>
      <p>底部信息</p>
    </template>
  </FeatureCard>
</template>
```

### 组件调用时直接写 TSX（单文件无状态组件）

```tsx
// tsx/InlineDemo.tsx
import { defineComponent, ref } from 'vue'

// 无状态函数组件（推荐）
const Badge = (props: { label: string; type?: 'success' | 'warning' | 'error' }) => (
  <span class={`badge badge-${props.type || 'default'}`}>{props.label}</span>
)

// 带逻辑的函数组件（需完整 defineComponent）
const Counter = defineComponent({
  props: {
    initial: { type: Number, default: 0 }
  },
  setup(props) {
    const count = ref(props.initial)
    return () => (
      <div class="counter">
        <span>{count.value}</span>
        <button onClick={() => count.value++}>+</button>
        <button onClick={() => count.value--}>-</button>
      </div>
    )
  }
})

export { Badge, Counter }
```

---

## setup 返回 render 函数（h()）

`h()` 是 Vue 的 hyperscript，生成 VNode。相比 TSX 更底层，无语法糖。

### h() 基础用法

```ts
import { defineComponent, h, ref } from 'vue'

export default defineComponent({
  setup(props, { emit, slots }) {
    const count = ref(0)

    // 返回渲染函数
    return () => h('div', { class: 'counter' }, [
      h('span', {}, count.value),
      h('button', {
        onClick: () => count.value++
      }, '+1')
    ])
  }
})
```

### h() 完整签名

```ts
// 完整签名（大部分场景可省略参数）
h('div', {
  class: 'container',
  style: { color: 'red' },
  id: 'main',
  onClick: () => {},
  // Vue 3.4+ 支持
  ...attrs
}, [
  h('span', null, 'Hello'),
  h('span', null, 'World')
])

// 第三个参数为字符串时作为文本内容
h('div', null, 'Hello World')

// 第三个参数为数组时作为子节点列表
h('div', null, [
  h('span', null, 'text'),
  h(OtherComponent, { prop: value })
])
```

### setup 返回 h() vs 返回 TSX 对比

| 维度 | h() render 函数 | setup + TSX |
|------|-----------------|-------------|
| 代码可读性 | 较繁琐 | 接近 HTML |
| 类型推导 | 手动标注多 | 自动推导 |
| 动态逻辑 | 需在函数内写 JS 逻辑 | JSX 内直接写 |
| 适用场景 | 极动态、超高性能 | 大部分场景 |

---

## template 中使用 TSX 组件

### 在 SFC 的 `<script setup lang="tsx">` 中使用 TSX 组件

```vue
<!-- src/App.vue -->
<script setup lang="tsx">
import { ref } from 'vue'
import TSXButton from './tsx/Button.tsx'
import TSXModal from './tsx/Modal.tsx'

const showModal = ref(false)
const buttonLabel = ref('打开弹窗')
</script>

<template>
  <div class="app">
    <h1>Vue 3 + TSX 混用示例</h1>

    <!-- TSX 组件直接在 template 中使用 -->
    <TSXButton
      :label="buttonLabel"
      type="primary"
      @click="showModal = true"
    />

    <TSXModal v-model:visible="showModal" title="提示">
      <p>这是弹窗内容</p>
      <template #footer>
        <button @click="showModal = false">关闭</button>
      </template>
    </TSXModal>
  </div>
</template>
```

### 混用场景：TSX 组件作为动态渲染容器

```vue
<script setup lang="tsx">
import { defineAsyncComponent, computed } from 'vue'
import DynamicRenderer from './tsx/DynamicRenderer.tsx'

// 根据条件动态选择组件
const formType = ref('input')
const items = ref(['apple', 'banana'])
</script>

<template>
  <DynamicRenderer :items="items" #default="{ item }">
    <span>{item}</span>
  </DynamicRenderer>
</template>
```

---

## render 函数 vs template

### 性能对比

| 指标 | template | render 函数 / TSX |
|------|----------|-------------------|
| 首屏渲染 | 需编译，稍慢 | 略快（无编译开销） |
| 更新渲染 | 编译优化好，更快 | 运行时执行，精确更新 |
| 大列表 | 虚拟 DOM diff 优化好 | 手动控制，细粒度更新 |
| 内存占用 | 编译后代码较大 | 代码精简 |

**结论**：
- 大部分场景 **template 更快**（Vue 模板编译器优化充分）
- 极复杂动态场景 **TSX/render 函数更灵活**
- 不要为了"性能"滥用 TSX，template 的开发体验和可维护性通常更好

### 代码组织建议

```
✅ 推荐的结构：
- 95% 业务组件：用 template（.vue）
- 动态渲染组件：用 TSX（.tsx）
- 工具类组件（Badge、Tag）：用 TSX
- 高度动态的列表渲染：用 TSX

❌ 不推荐的场景：
- 简单静态展示组件用 TSX（template 更简洁）
- 不需要类型推导的简单组件用 TSX
```

---

## Vue 3 TSX 语法细节

### 1. 事件处理

```tsx
// React: onClick
// Vue TSX: onClick（与 React 相同）
<button onClick={handleClick}>点击</button>

// 事件修饰符在 TSX 中不可用，需要手动处理
// template: @click.stop="handler"
// TSX:
<button onClick={(e) => {
  e.stopPropagation()
  handler()
}}>阻止冒泡</button>

// 常用修饰符手动处理对照
// @click.prevent      → e.preventDefault()
// @click.stop         → e.stopPropagation()
// @click.self         → e.target === e.currentTarget
// @keyup.enter        → e.key === 'Enter'
// @click.ctrl         → e.ctrlKey
```

### 2. 条件渲染

```tsx
// v-if → 三元表达式或 &&
{showFlag && <div>显示内容</div>}
{flag ? <A /> : <B />}

// v-show → 使用 style 控制
<div style={{ display: showFlag ? 'block' : 'none' }}>内容</div>
```

### 3. 列表渲染

```tsx
// v-for → map
{items.map(item => (
  <div key={item.id}>
    <span>{item.name}</span>
    <span>{item.value}</span>
  </div>
))}
```

### 4. v-model 支持

```tsx
// Vue TSX 中 v-model 需要手动实现
// template: <Input v-model="text" />
// TSX:
const [text, setText] = useState('')
<input value={text} onInput={(e) => setText(e.target.value)} />
```

> Vue 3.4+ 引入了 `defineModel`，在 TSX 中不直接可用，需要手动模拟。

### 5. 插槽（slots vs children）

```tsx
// TSX 组件的插槽传递
// template:
<MyComponent>
  <template #header>标题</template>
  <div>内容</div>
</MyComponent>

// TSX 对应写法：
<MyComponent
  v-slots={{
    header: () => <span>标题</span>,
    default: () => <div>内容</div>
  }}
/>

// 或者使用 useSlots() 获取
const slots = useSlots()
<div>
  {slots.header?.()}
  {slots.default?.()}
</div>

// 子元素作为默认插槽（children）
// template: <Wrapper>hello</Wrapper>
// TSX:
<Wrapper>hello</Wrapper>
// 在 Wrapper 内部通过 slots.default?.() 获取
```

### 6. 动态组件

```tsx
import { defineComponent, ref } from 'vue'

// 方式一：is 属性
const Current = ref(CompA)
<component is={Current.value} />

// 方式二：动态字符串（需配合 resolveComponent）
<component is="button" />
```

### 7. CSS Modules 与样式

```tsx
// TSX 中使用 scoped 样式需要通过 vue-loader
// 推荐使用 CSS Modules 或 UnoCSS

// 方式一：内联样式
<div style={{ color: 'red', fontSize: '14px' }}>内容</div>

// 方式二：CSS Modules
import styles from './Button.module.css'
<button class={styles.primary}>按钮</button>

// 方式三：class 绑定（推荐）
<div class={['base', { 'active': isActive }]}>内容</div>
```

### 8. ref 和响应式在 TSX 中

```tsx
import { defineComponent, ref, reactive, computed } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)
    const state = reactive({ name: 'Vue' })
    const doubled = computed(() => count.value * 2)

    // TSX 中访问 ref 不需要 .value（Vue 自动解包）
    return () => (
      <div>
        <span>{count} {/* 自动解包，等同于 count.value */}</span>
        <span>{state.name}</span>
        <span>{doubled.value}</span>
      </div>
    )
  }
})
```

---

## 常见问题

### Q1: TSX 和 template 哪个性能更好？

大部分场景下 template 性能更好。Vue 的模板编译器会进行静态提升、缓存事件处理器等优化。对于简单组件，template 的编译产物更高效。只有在需要程序化创建组件或处理极端动态渲染时，TSX/render 函数才有明显优势。

### Q2: defineComponent 的 setup 返回 render 函数和返回 JSX 有什么区别？

返回 render 函数使用 `h()` 手动构建 VNode，适合需要精确控制渲染过程的场景。返回 JSX 语法更简洁，接近普通 HTML/JS 混合写法。两者在运行时完全等价，都是构建 VNode。

### Q3: Vue 3 TSX 中如何使用 v-model？

```tsx
// 需要手动实现双向绑定
const modelValue = ref('')
<input
  value={modelValue.value}
  onInput={(e) => modelValue.value = e.target.value}
/>
```

### Q4: TSX 组件中如何使用 emit？

```tsx
export default defineComponent({
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    return () => (
      <div>
        <button onClick={() => emit('confirm')}>确认</button>
        <button onClick={() => emit('cancel')}>取消</button>
      </div>
    )
  }
})
```

### Q5: Vue 3 TSX 是否支持指令（v-if/v-for/v-show 等）？

不支持。TSX 中需要使用 JavaScript 原生语法替代：
- `v-if` → `condition && <Element />` 或三元表达式
- `v-for` → `.map()`
- `v-show` → `style={{ display: condition ? 'block' : 'none' }}`
- `v-model` → 手动实现

### Q6: 如何在 TSX 中使用 async/await？

```tsx
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  setup() {
    const data = ref<any[]>([])

    onMounted(async () => {
      const res = await fetch('/api/data')
      data.value = await res.json()
    })

    return () => (
      <div>
        {data.value.map(item => <div key={item.id}>{item.name}</div>)}
      </div>
    )
  }
})
```

### Q7: setup + TSX 中如何使用生命周期钩子？

与 Composition API 完全一致：

```tsx
import { defineComponent, onMounted, onUpdated, onUnmounted, ref } from 'vue'

export default defineComponent({
  name: 'LifecycleDemo',
  setup() {
    const count = ref(0)

    onMounted(() => {
      console.log('组件挂载')
    })

    onUpdated(() => {
      console.log('组件更新')
    })

    onUnmounted(() => {
      console.log('组件卸载')
    })

    return () => <button onClick={() => count.value++}>{count.value}</button>
  }
})
```

### Q8: Vue 3 TSX 和 React JSX 的区别？

| 特性 | Vue 3 TSX | React JSX |
|------|-----------|-----------|
| 事件绑定 | `onClick={fn}` | `onClick={fn}` |
| 条件渲染 | `flag && <A />` | `{flag && <A />}` |
| 列表渲染 | `.map()` | `.map()` |
| 双向绑定 | 需手动实现 | 需手动实现 |
| v-model | 需手动实现 | 无 |
| 样式 | `class` / `style` | `className` / `style` |
| 响应式 | 依赖自动解包 | 完全响应式 |

---

## 相关文件

- [基础渲染函数](../demos/basic-render.html)
- [h() 函数参数](../demos/h-args.html)
- [setup 返回渲染函数](../demos/SetupReturnRender.vue)
- [函数组件](../demos/FunctionComponent.html)
