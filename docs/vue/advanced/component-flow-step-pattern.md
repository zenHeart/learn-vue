# Vue 组件流程步骤模式——将复杂组件作为流程步骤

> 本文档探讨如何将确认框等复杂组件设计为顺序流程中的一个步骤，涵盖 Step Pattern、State Machine、Flow Context 等设计模式

## 目录

1. [问题背景](#1-问题背景)
2. [核心概念](#2-核心概念)
3. [Vue 实现方案](#3-vue-实现方案)
4. [常见场景](#4-常见场景)
5. [Vue vs React 对比](#5-vue-vs-react-对比)
6. [最佳实践与踩坑点](#6-最佳实践与踩坑点)

---

## 1. 问题背景

### 1.1 传统方式的困境

```vue
<!-- 传统的确认框实现：嵌套 if-else -->
<template>
  <div>
    <!-- 步骤1 -->
    <Step1 v-if="currentStep === 1" @next="currentStep = 2" />
    
    <!-- 步骤2：确认框 -->
    <ConfirmDialog 
      v-if="currentStep === 2" 
      :message="confirmMessage"
      @confirm="handleConfirm"
      @cancel="currentStep = 1"
    />
    
    <!-- 步骤3：结果 -->
    <Result v-if="currentStep === 3" :data="result" />
  </div>
</template>
```

**问题**：
- 步骤间数据传递混乱
- 状态管理分散在父组件
- 难以复用和测试
- 扩展新步骤需要修改父组件

### 1.2 为什么需要流程步骤化？

| 诉求 | 解决方案 |
|------|----------|
| 步骤间共享数据 | Flow Context（provide/inject） |
| 步骤切换逻辑 | State Machine Pattern |
| 步骤可复用、可组合 | Compound Component Pattern |
| 步骤切换动画 | Vue Transition |

---

## 2. 核心概念

### 2.1 Step Pattern（步骤模式）

将一个完整流程拆分为多个独立的步骤组件，每个步骤：
- 负责单一的业务逻辑
- 通过统一的接口与流程容器通信
- 可以独立测试和复用

```
┌─────────────────────────────────────┐
│         FlowContainer              │
│  ┌─────────────────────────────┐   │
│  │     StepIndicator          │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │     <Step1> → <Step2> →    │   │
│  │     <Step3> → <StepN>      │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │     StepNavigation          │   │
│  │  [上一步]  [下一步]  [取消]  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 2.2 State Machine Pattern（状态机模式）

用有限状态机管理流程状态转换，确保：
- 状态转换可预测
- 不会出现非法状态
- 转换历史可追踪

```typescript
// 状态定义
type StepState = 'idle' | 'input' | 'confirm' | 'processing' | 'success' | 'error'

// 转换规则
const transitions = {
  idle: ['start'],
  input: ['next', 'cancel'],
  confirm: ['back', 'confirm', 'cancel'],
  processing: [], // 自动转换
  success: ['restart'],
  error: ['retry', 'cancel']
}
```

### 2.3 Flow Context（流程上下文）

通过 Vue 的 provide/inject 机制，在流程容器和步骤组件间传递：
- 当前步骤状态
- 共享表单数据
- 流程控制方法（next/prev/complete）
- 回调函数

---

## 3. Vue 实现方案

### 3.1 Flow Context——provide/inject 传递上下文

```vue
<!-- FlowContainer.vue -->
<script setup>
import { provide, ref, computed } from 'vue'
import StepIndicator from './StepIndicator.vue'
import StepNavigation from './StepNavigation.vue'

// 步骤定义
const steps = [
  { id: 'input', title: '填写信息' },
  { id: 'confirm', title: '确认信息' },
  { id: 'result', title: '完成' }
]

// 当前步骤索引
const currentIndex = ref(0)

// 共享的表单数据
const formData = ref({
  username: '',
  email: ''
})

// 计算当前步骤
const currentStep = computed(() => steps[currentIndex.value])

// 是否可以前进/后退
const canNext = computed(() => currentIndex.value < steps.length - 1)
const canPrev = computed(() => currentIndex.value > 0)

// 步骤控制方法
function next() {
  if (canNext.value) currentIndex.value++
}

function prev() {
  if (canPrev.value) currentIndex.value--
}

function goTo(index) {
  if (index >= 0 && index < steps.length) {
    currentIndex.value = index
  }
}

// 提供上下文给子组件
provide('flow', {
  steps,
  currentIndex,
  currentStep,
  formData,
  canNext,
  canPrev,
  next,
  prev,
  goTo
})
</script>

<template>
  <div class="flow-container">
    <StepIndicator />
    <div class="step-content">
      <slot />
    </div>
    <StepNavigation />
  </div>
</template>
```

```vue
<!-- 步骤组件示例：InputStep.vue -->
<script setup>
import { inject } from 'vue'

const { formData, next, canNext } = inject('flow')

function handleSubmit() {
  if (formData.value.username && formData.value.email) {
    next()
  }
}
</script>

<template>
  <div class="step-input">
    <h3>填写信息</h3>
    <input 
      v-model="formData.username" 
      placeholder="用户名"
    />
    <input 
      v-model="formData.email" 
      placeholder="邮箱"
    />
    <button @click="handleSubmit" :disabled="!canNext">
      下一步
    </button>
  </div>
</template>
```

### 3.2 defineEmits + v-model 控制步骤切换

```vue
<!-- StepWrapper.vue - 步骤包装器 -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  totalSteps: { type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const currentStep = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 暴露方法给父组件
defineExpose({
  next: () => currentStep.value++,
  prev: () => currentStep.value--,
  goTo: (index) => currentStep.value = index
})
</script>

<template>
  <div class="step-wrapper">
    <slot />
  </div>
</template>
```

```vue
<!-- 父组件使用 -->
<script setup>
import { ref } from 'vue'
import StepWrapper from './StepWrapper.vue'
import Step1 from './steps/Step1.vue'
import Step2 from './steps/Step2.vue'
import ConfirmStep from './steps/ConfirmStep.vue'

const currentStep = ref(0)
const stepWrapper = ref(null)
const totalSteps = 3

function handleNext() {
  stepWrapper.value?.next()
}
</script>

<template>
  <StepWrapper 
    v-model="currentStep" 
    :total-steps="totalSteps"
    ref="stepWrapper"
  >
    <!-- 根据步骤显示不同内容 -->
    <KeepAlive>
      <Step1 v-if="currentStep === 0" />
      <ConfirmStep v-else-if="currentStep === 1" />
      <Step2 v-else />
    </KeepAlive>
  </StepWrapper>
  
  <button @click="handleNext">下一步</button>
</template>
```

### 3.3 确认框作为独立步骤

```vue
<!-- ConfirmStep.vue -->
<script setup>
import { inject, computed } from 'vue'

const { formData, next, prev } = inject('flow')

// 确认消息内容
const confirmMessage = computed(() => 
  `确定要提交以下信息吗？\n用户名：${formData.username}\n邮箱：${formData.email}`
)

function handleConfirm() {
  // 执行确认操作
  next()
}

function handleCancel() {
  prev()
}
</script>

<template>
  <div class="confirm-step">
    <div class="confirm-box">
      <div class="confirm-icon">⚠️</div>
      <h3>确认提交</h3>
      <pre class="confirm-message">{{ confirmMessage }}</pre>
      <div class="confirm-actions">
        <button class="btn-cancel" @click="handleCancel">
          返回修改
        </button>
        <button class="btn-confirm" @click="handleConfirm">
          确认提交
        </button>
      </div>
    </div>
  </div>
</template>
```

### 3.4 完整的状态机实现

```typescript
// useFlowMachine.js - 流程状态机 composable
import { ref, computed } from 'vue'

export function useFlowMachine(initialState = 'idle') {
  // 状态定义
  const states = {
    idle: { next: 'input' },
    input: { next: 'confirm', cancel: 'idle' },
    confirm: { next: 'processing', back: 'input', cancel: 'idle' },
    processing: { next: 'success', error: 'error' },
    success: { restart: 'idle' },
    error: { retry: 'confirm', cancel: 'idle' }
  }

  const currentState = ref(initialState)
  const history = ref([initialState])

  // 尝试执行转换
  function transition(action) {
    const allowed = states[currentState.value]
    if (allowed && action in allowed) {
      const newState = allowed[action]
      currentState.value = newState
      history.value.push(newState)
      return true
    }
    console.warn(`Invalid transition: ${action} from ${currentState.value}`)
    return false
  }

  // 检查是否可以执行某个动作
  function can(action) {
    const allowed = states[currentState.value]
    return !!(allowed && action in allowed)
  }

  // 重置状态机
  function reset() {
    currentState.value = initialState
    history.value = [initialState]
  }

  return {
    currentState: computed(() => currentState.value),
    history: computed(() => history.value),
    transition,
    can,
    reset
  }
}
```

---

## 4. 常见场景

### 4.1 多步骤表单（输入 → 确认 → 提交）

```vue
<!-- MultiStepForm.vue -->
<script setup>
import { provide, ref } from 'vue'
import StepIndicator from './StepIndicator.vue'

// 步骤定义
const stepDefinitions = [
  { id: 'basic', title: '基本信息' },
  { id: 'contact', title: '联系方式' },
  { id: 'confirm', title: '确认信息' },
  { id: 'done', title: '完成' }
]

// 共享数据
const formData = ref({
  // 步骤1
  name: '',
  age: null,
  // 步骤2
  phone: '',
  address: ''
})

provide('formFlow', {
  steps: stepDefinitions,
  formData,
  currentStep: ref(0)
})
</script>

<template>
  <div class="multi-step-form">
    <StepIndicator :steps="stepDefinitions" :current-step="0" />
    <div class="form-content">
      <slot />
    </div>
  </div>
</template>
```

### 4.2 删除确认流程（选择 → 二次确认 → 执行）

```vue
<!-- DeleteConfirmFlow.vue -->
<script setup>
import { provide, ref, computed } from 'vue'
import { useFlowMachine } from './useFlowMachine'

// 使用状态机管理删除流程
const { currentState, transition, can } = useFlowMachine('selecting')

// 待删除项
const selectedItems = ref([])

// 流程上下文
provide('deleteFlow', {
  currentState,
  selectedItems,
  transition,
  can,
  confirmDelete: () => {
    // 执行删除逻辑
    transition('next')
  }
})
</script>

<template>
  <div class="delete-flow">
    <!-- 步骤1：选择 -->
    <SelectStep v-if="currentState === 'selecting'" />
    
    <!-- 步骤2：确认 -->
    <ConfirmStep v-else-if="currentState === 'confirming'" />
    
    <!-- 步骤3：结果 -->
    <ResultStep v-else-if="currentState === 'done'" />
  </div>
</template>
```

### 4.3 审批流（提交 → 审批 → 完成）

```vue
<!-- ApprovalFlow.vue -->
<script setup>
import { provide, ref, computed } from 'vue'
import { useFlowMachine } from './useFlowMachine'

const { currentState, transition, can } = useFlowMachine('draft')

const approvalData = ref({
  title: '',
  content: '',
  approver: null,
  status: 'pending'
})

provide('approvalFlow', {
  currentState,
  approvalData,
  transition,
  can
})
</script>

<template>
  <div class="approval-flow">
    <!-- 草稿状态 -->
    <DraftStep v-if="currentState === 'draft'" />
    
    <!-- 审批中 -->
    <PendingStep v-else-if="currentState === 'pending'" />
    
    <!-- 已通过 -->
    <ApprovedStep v-else-if="currentState === 'approved'" />
    
    <!-- 已拒绝 -->
    <RejectedStep v-else-if="currentState === 'rejected'" />
  </div>
</template>
```

---

## 5. Vue vs React 对比

### 5.1 Render Props vs Scoped Slot

| 特性 | React Render Props | Vue Scoped Slot |
|------|-------------------|-----------------|
| 语法 | `<Component render={(props) => ...}` | `<Component v-slot="{ scope }">` |
| 灵活性 | 极高，可自定义渲染逻辑 | 较局限，适合内容替换 |
| 学习曲线 | 较高 | 较低 |
| TypeScript 支持 | 好 | 非常好 |

```tsx
// React - Render Props 方式
function FlowContainer({ children }) {
  const [step, setStep] = useState(0)
  
  const flowContext = { step, next: () => setStep(s => s + 1) }
  
  return (
    <div>
      {children(flowContext)}
    </div>
  )
}

// 使用
<FlowContainer>
  {(flow) => (
    <div>
      <p>Step: {flow.step}</p>
      <button onClick={flow.next}>Next</button>
    </div>
  )}
</FlowContainer>
```

```vue
<!-- Vue - Scoped Slot 方式 -->
<script setup>
import { provide, ref } from 'vue'

const currentStep = ref(0)
provide('flow', { currentStep, next: () => currentStep.value++ })
</script>

<template>
  <div>
    <slot :current-step="currentStep" :next="() => currentStep++" />
  </div>
</template>

<!-- 使用 -->
<FlowContainer v-slot="{ currentStep, next }">
  <div>
    <p>Step: {{ currentStep }}</p>
    <button @click="next">Next</button>
  </div>
</FlowContainer>
```

### 5.2 状态管理方案对比

| 场景 | Vue 方案 | React 方案 |
|------|---------|-----------|
| 组件内状态 | `ref/reactive` | `useState` |
| 跨组件共享 | `provide/inject` | Context + useContext |
| 全局状态 | Pinia | Redux/Zustand |
| 状态不变性 | Proxy 响应式 | Immer/immutable |

---

## 6. 最佳实践与踩坑点

### 6.1 最佳实践

**1. 单一职责原则**

```vue
<!-- ✅ 好的设计：步骤组件只关心自己的业务 -->
<template>
  <div class="input-step">
    <slot /> <!-- 可以放表单字段 -->
    <button @click="handleNext">下一步</button>
  </div>
</template>
```

**2. 统一的步骤接口**

```typescript
// 所有步骤组件应遵循的统一接口
interface StepComponent {
  // 暴露给父组件的方法
  validate?: () => boolean | Promise<boolean>
  reset?: () => void
  // 接收的 props
  flowContext: FlowContext
}
```

**3. 使用 KeepAlive 保持步骤状态**

```vue
<template>
  <KeepAlive :include="['Step1', 'Step2', 'ConfirmStep']">
    <component :is="currentStepComponent" />
  </KeepAlive>
</template>
```

**4. 步骤切换动画**

```vue
<template>
  <Transition name="step">
    <component :is="currentStepComponent" :key="currentStep" />
  </Transition>
</template>

<style>
.step-enter-active,
.step-leave-active {
  transition: all 0.3s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
```

### 6.2 踩坑点

**1. 响应式丢失问题**

```typescript
// ❌ 错误：解构 inject 的响应式对象会丢失响应性
const { currentStep } = inject('flow')
// currentStep 不再是响应式的！

// ✅ 正确：保持响应性
const flow = inject('flow')
const currentStep = computed(() => flow.currentStep.value)
```

**2. provide/inject 作用域**

```typescript
// ❌ 错误：在 setup 顶部调用 inject
const flow = inject('flow') // 可能返回 undefined

// ✅ 正确：在 setup 函数体内调用
function MyComponent() {
  const flow = inject('flow') // 确保在 provider 层级内
}
```

**3. 循环依赖**

```vue
<!-- ❌ 错误：父子组件互相引用 -->
<!-- Parent.vue -->
<!-- Child.vue -->
<!-- Parent provides 'flow', Child emits to Parent, Parent imports Child -->

<!-- ✅ 正确：使用事件总线或状态管理 -->
<!-- EventBus.vue - 独立的事件中心 -->
<!-- StepComponent.vue - 只通过事件与容器通信 -->
```

**4. 类型定义**

```typescript
// ✅ 推荐：为 Flow Context 定义类型
interface FlowContext {
  readonly currentStep: Ref<number>
  readonly steps: StepDefinition[]
  readonly formData: ShallowRef<FormData>
  next: () => void
  prev: () => void
  goTo: (index: number) => void
}
```

**5. 表单数据异步验证**

```vue
<script setup>
import { ref } from 'vue'

const flow = inject('flow')
const isValidating = ref(false)
const errorMessage = ref('')

async function handleNext() {
  isValidating.value = true
  try {
    const isValid = await validateForm(flow.formData)
    if (isValid) {
      flow.next()
    } else {
      errorMessage.value = '表单验证失败'
    }
  } finally {
    isValidating.value = false
  }
}
</script>
```

---

## 总结

将复杂组件设计为流程步骤的核心思想：

1. **分层解耦**：步骤组件只关心自己的业务逻辑，流程控制交给容器
2. **上下文共享**：通过 provide/inject 传递流程状态，避免 prop drilling
3. **状态机管理**：用有限状态机确保状态转换的可预测性和安全性
4. **统一接口**：定义标准化的步骤组件接口，便于扩展和复用
5. **渐进增强**：从简单的步骤切换开始，逐步添加动画、验证等功能

这种方法不仅适用于确认框，更是一种通用的流程编排模式，可以灵活应对各种复杂的前端交互场景。
