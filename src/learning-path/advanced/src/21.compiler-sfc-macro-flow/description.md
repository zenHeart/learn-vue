> **版本**：Vue 3.x（SFC compiler）| **状态**：stable | **源码**：`packages/compiler-sfc/src/script/defineProps.ts`、`packages/compiler-sfc/src/script/defineEmits.ts` | **延伸阅读**：[Vue 官方 · `<script setup>`](https://cn.vuejs.org/api/sfc-script-setup.html)

# `defineProps<T>` / `withDefaults` 编译期展开

## 这是什么

`defineProps<T>()` 与 `defineEmits<T>()` 不是运行时函数——它们是**编译期宏**（compiler macros），由 `@vue/compiler-sfc` 的 `compileScript()` 在 SFC 编译阶段**就地展开**为等价的运行时声明：

```ts
// 用户写的：
const props = defineProps<{ count: number; mode?: string }>()
const emit = defineEmits<{ change: [v: string] }>()

// compiler-sfc 编译后（简化）：
import { defineComponent as _defineComponent } from 'vue'
export default _defineComponent({
  emits: ['change'],
  props: { count: {}, mode: { required: false } },
  setup(__props, { emit, expose }) {
    const props = __props
    // ... 你的 setup 主体
    return { props, emit /* 如果你引用了 emit */ }
  }
})
```

**宏的本质**：被编译期识别 → 从代码 AST 中提取类型 / 默认值 → 替换为 props 对象 → 完全消失于运行时。

## 源码走读

`packages/compiler-sfc/src/script/defineProps.ts`：

```ts
export const DEFINE_PROPS = 'defineProps'
export const WITH_DEFAULTS = 'withDefaults'

export function processDefineProps(
  ctx: ScriptCompileContext,
  node: Node,
  declId?: LVal,
) {
  // 1. 校验：必须出现在 <script setup> 顶层
  // 2. 提取类型参数 T 从 generic.ts
  // 3. 把类型 T 翻译成 props 对象字面量
  // 4. 重写 AST 节点为 const props = __props
}
```

类型 → props 对象字面量的转换：

```ts
function genRuntimePropFromType(type: TSType, key: string) {
  // 基础类型 → { type: Number } / { type: String[] }
  // 对象字面量 → 透传
  // 必填 → { required: true }
  // 可选 → 省略 default
}
```

## `withDefaults<T, D>()` 展开

```ts
// 用户
const props = withDefaults(
  defineProps<{ count?: number; mode?: string }>(),
  { count: 0, mode: 'auto' }
)

// 编译后
const props = _withDefaults(
  { count: { default: 0 }, mode: { default: 'auto' } },
)
```

注意：使用 `withDefaults` 时，`defineProps<T>` 编译产物的 props 对象**包含 `default` 字段**——而非只有类型。

## 实战场景

1. **IDE 智能提示**：`defineProps<T>` 中 T 是类型，IDE 提供属性补全；展开后 props 对象是运行时结构，无法做类型校验。
2. **重写 SFC 编译器**：自己写 vite 插件或 esbuild 插件时复用 `@vue/compiler-sfc`。
3. **运行时 vs 编译期边界**：知道哪些 API 是宏，避免在循环或条件分支里调用（会报编译错误）。

## 常见踩坑

- **不能嵌套调用**：`withDefaults(defineProps(...), ...)` 必须直接嵌套；不能 `const p = defineProps(...)` 然后 `withDefaults(p, ...)`——编译器无法二次提取。
- **不能在普通函数内调用**：宏必须是 `<script setup>` 顶层；包在 if/for 内会报 `defineProps() has been called multiple times`。
- **泛型参数必须字面量**：`<T extends ...>` 中的 T 必须是具体类型，不能引用外部泛型——编译器做静态提取，不做类型求值。
- **同名 import**：如果代码里 `import { defineProps } from 'vue'`，会和编译器宏冲突，导致宏不展开。**不要显式 import defineProps / defineEmits / withDefaults**。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · script setup 编译](https://cn.vuejs.org/api/sfc-script-setup.html) | 宏列表与规则 |
| [Vue 源码 · compiler-sfc](https://github.com/vuejs/core/tree/main/packages/compiler-sfc/src/script) | 宏处理器 |
| [Vue 源码 · defineProps.ts](https://github.com/vuejs/core/blob/main/packages/compiler-sfc/src/script/defineProps.ts) | 类型 → props 对象 |
| [Vue Mastery · SFC 编译流程](https://www.vuemastery.com/) | 视频教程 |

<!-- description.md -->
