> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/apiSetupHelpers.ts` | **延伸阅读**：[Vue 官方 · TypeScript 工具类型](https://vuejs.org/api/utility-types.html) | [TypeScript 手册](https://www.typescriptlang.org/docs/handbook/utility-types.html)

# PropType 与 ExtractPropTypes：从运行时 props 推导静态类型

## 这是什么

Vue 暴露了两个互补的工具类型，专门解决"运行时 props 选项 → 静态 TS 类型"的提取问题：

```ts
import type { PropType, ExtractPropTypes } from 'vue'

const props = {
  // PropType<T> 给运行时构造器附加 TS 推断
  user: { type: Object as PropType<User>, required: true },
  tags: { type: Array as PropType<string[]>, default: () => [] },
  // 普通写法也行，TS 会自动从构造函数推导类型
  size: { type: String, default: 'medium' },
} as const

// ExtractPropTypes 把运行时对象编译成 { user: User, tags: string[], size: string }
type Props = ExtractPropTypes<typeof props>

const props2 = defineProps(props)
// 这里的 props2 类型 = Props，模板里 {{ props2.user.name }} 完全推断
```

### 为什么需要 PropType？

不带 `<User>` 时，TS 只能推导出 `{ type: ObjectConstructor }`，丢失真正的业务类型。`PropType<User>` 把"运行时构造器"二次声明为"该构造器代表的具体类型"——这是 TS 在 `as` 之外少数能"反向标注"运行时值的方式。

### ExtractPropTypes vs ExtractPublicPropTypes

| 类型 | 行为 |
| --- | --- |
| `ExtractPropTypes<T>` | 完整 props，包含 private（带默认值推断） |
| `ExtractPublicPropTypes<T>` | 仅保留对外暴露的 props（公共 API） |

Vue 3.3+ 推出后者，因为 props 选项可能包含 `internal-*` 之类的内部状态，发布到外部组件库时不应暴露。

## 源码走读

`packages/runtime-core/src/apiSetupHelpers.ts`：

- `L13-14` `PropType<T>` 定义：把构造器类型转换为 T
- `L99-130` `ExtractPropTypes<Options>` 实现：遍历 props options，根据 `{ type, required, default }` 推导每个字段类型

运行时归一化在 `componentProps.ts` 的 `normalizePropsOptions`，TS 侧 `ExtractPropTypes` 是编译期零成本转换。

## 实战场景

1. **复杂对象的 props**：表单配置、表格列定义等嵌套结构，靠 PropType 避免 `any` 满天飞。
2. **数组类型的 props**：`type: Array as PropType<TagItem[]>`，模板里直接 `item.label` 不报错。
3. **组件库 API 类型**：把 `ExtractPublicPropTypes` 暴露为组件库的 `Props` 类型，README 自动同步。
4. **JSX/TSX 复用**：用 `defineComponent<ExtractPropTypes<typeof props>>()` 把 SFC props 复用进 TSX 文件。

## 常见踩坑

- **不要把 PropType 用在 defineProps\<T\>**：`defineProps<T>()` 已经接受 TS 类型，PropType 只用于"运行时声明 + TS 类型"双轨制。
- **`default` 不能写非字面量函数**：`default: () => new Date()` 会导致 ExtractPropTypes 推断 `Date | undefined` 而非 `Date`——因为 TS 不会调用工厂函数。解决：用 `withDefaults` 或保留 required。
- **`as const` 影响 ExtractPropTypes**：写法 `{ type: String, default: 'a' } as const` 会让 default 字面量类型变成 `'a'`，模板里就拿不到宽松的 `string`。
- **`ExtractPropTypes` 对 default 函数体不感知**：内部用 `Awaited<ReturnType<typeof default>>` 推导，只有函数体返回类型稳定时才能正确推断。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · Utility Types](https://vuejs.org/api/utility-types.html#proptype-t) | PropType 与 ExtractPropTypes |
| [Vue 官方 · Utility Types · ExtractPublicPropTypes](https://vuejs.org/api/utility-types.html#extractpublicproptypes) | 公共 API 类型提取 |
| [Vue 源码 · apiSetupHelpers.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiSetupHelpers.ts) | 类型定义实现 |
| [TypeScript · Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) | 工具类型背后的 TS 机制 |
| [Vue 3 RFC · type-only props](https://github.com/vuejs/rfcs/discussions/502) | 类型化 props 演进 |