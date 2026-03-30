# Vue 3 + TypeScript 常见报错与解决方案

## 1. 类型推断为 never

### 报错
```
Type 'xxx' is inferred as never type.
```

### 原因
TypeScript 无法推断类型时默认为 `never`，常见于 reactive/ref 初始值缺失。

### 解决
```typescript
// ❌ 报错
const state = reactive({});
state.name = 'test'; // Error

// ✅ 指定类型
const state = reactive<{ name: string }>({});
state.name = 'test'; // OK

// ✅ 使用 ref 并指定类型
const name = ref<string>('');
name.value = 'test'; // OK
```

---

## 2. Property does not exist on type

### 报错
```
Property 'xxx' does not exist on type 'yyy'
```

### 原因
TS 无法识别 Vue 组件实例上的属性（如 `defineExpose` 或 `defineProps` 生成的属性）。

### 解决
```typescript
// ✅ 使用 defineProps 配合类型
interface Props {
  title: string;
  count?: number;
}
const props = defineProps<Props>();

// ✅ 使用 withDefaults（Vue 3.3+）
const props = withDefaults(defineProps<Props>(), {
  count: 0
});
```

---

## 3. Cannot find module or its type declarations

### 报错
```
Cannot find module './xxx.vue' or its corresponding type declarations.
```

### 原因
缺少 Vue TSC 类型声明。

### 解决
```typescript
// src/shims-vue.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

---

## 4. Module has no exported member

### 报错
```
Module has no exported member 'xxx'
```

### 原因
导入方式与导出方式不匹配。

### 解决
```typescript
// 确保使用正确的 import 语法
// ❌
import { createApp } from 'vue/dist/vue.esm-bundler'

// ✅
import { createApp } from 'vue'
```

---

## 5. Volar 插件问题

### 解决
```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "jsx": "preserve"
  }
}
```

---

## 6. defineEmits 类型问题

```typescript
// ❌
const emit = defineEmits(['update:modelValue'])

// ✅
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
```

---

## 7. 参考配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "skipLibCheck": true,
    "types": ["vite/client"]
  }
}
```
