> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-dom/src/index.ts` | **延伸阅读**：[Vue 官方 · TSX](https://vuejs.org/guide/typescript/overview.html#tsx) | [Babel Plugin JSX](https://github.com/vuejs/babel-plugin-jsx)

# Vue TSX 与显式 defineComponent 类型

## 这是什么

TSX 是 Vue 的另一种单文件形式：用 `JSX.Element` 风格写组件，配合 `defineComponent` 完成类型注入。它比 SFC 更接近 React 写法，适合：

- 组件结构复杂、模板里 v-if/v-for 嵌套太深
- 项目已经大量使用 React / TSX 风格，希望保持一致
- 需要 TypeScript 类型推导贯穿整个组件树

```tsx
import { defineComponent, PropType, ref, type Ref } from 'vue'

interface User { id: number; name: string }

export default defineComponent({
  props: {
    users: { type: Array as PropType<User[]>, required: true },
    title: { type: String, default: 'list' },
  },
  setup(props) {
    const selectedId: Ref<number | null> = ref(null)
    function pick(id: number) { selectedId.value = id }
    return { selectedId, pick }
  },
  render() {
    return (
      <div class="list">
        <h3>{this.title}</h3>
        {this.users.map(u => (
          <div
            key={u.id}
            class={{ active: this.selectedId === u.id }}
            onClick={() => this.pick(u.id)}
          >
            {u.name}
          </div>
        ))}
      </div>
    )
  },
})
```

### SFC vs TSX 对比

| 维度 | SFC | TSX |
| --- | --- | --- |
| 类型推导 | `defineProps<T>()` 编译时 | 显式 `defineComponent` + JSX |
| 模板语法 | 类 HTML | JSX 表达式 |
| scoped style | 内置 `<style scoped>` | 需外部 CSS / CSS Modules |
| 文件后缀 | `.vue` | `.tsx` |
| 编译工具 | `@vitejs/plugin-vue` + `@vue/compiler-sfc` | `@vitejs/plugin-vue-jsx` + `@vue/babel-plugin-jsx` |

### defineComponent 显式参数化

```ts
defineComponent<
  Props,          // 组件 props
  RawBindings,    // setup 返回的 raw bindings
  D,              // data
  C,              // computed
  M,              // methods
  Mixin,
  Extends,
  InjectOptions,
  InjectKeys,
  Slots,
  LocalComponents,
  Directives,
  Exposed
>(...)
```

绝大多数情况只需 `<Props, RawBindings>` 两个参数；其他参数保持默认 `{}`。

## 源码走读

`packages/runtime-core/src/apiDefineComponent.ts` 是 defineComponent 的实现入口：

- `L33-110` 主签名：`<Props, RawBindings, D, ...>(options): DefineComponent<...>`
- `L120-150` 工具类型 `DefineComponent` 把 props / emits / slots / expose 全部聚合成组件对外类型
- `L170-200` setup 返回值与 render 函数类型融合

JSX 类型来自 `@vue/runtime-dom/jsx-runtime`，由 `@vue/babel-plugin-jsx` 注入。

## 实战场景

1. **复杂条件渲染**：表单生成器、可视化编辑器里 v-if/v-for 三层嵌套，TSX 的 `{cond && <X />}` 更清爽。
2. **跨框架迁移**：从 React 迁移过来的团队，对 TSX 语法更熟悉，迁移成本低。
3. **递归组件**：自己引用自己的组件（如 Tree），JSX 里 `import Self from './Tree'` 比 SFC `name: 'Tree'` 更直接。
4. **类型驱动开发**：组件完全靠 props + emits 的类型驱动，重构时 TS 直接报所有调用方错误。

## 常见踩坑

- **`onClick` vs `@click`**：JSX 里事件属性是 camelCase（`onClick`），不是 SFC 的 `@click`。
- **`v-model` 不存在**：JSX 里手动写 `onUpdate:modelValue={e => state.value = e}` 或 `vModelText` helper。
- **`class` / `style` 是对象**：`class={{ active: true }}` 永远用对象语法，不用 string concat。
- **`key` 必填**：列表渲染必须传 `key`，TSX 不会像 SFC 那样帮你从 v-for 自动加上。
- **`ref` 与模板 ref 不一样**：JSX 里 `<input ref={elRef}>`，`elRef` 是 `Ref<HTMLInputElement | null>`；SFC 里的 `useTemplateRef` 不适用。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · TSX](https://vuejs.org/guide/typescript/overview.html#tsx) | 官方 TSX 指南 |
| [Babel Plugin JSX](https://github.com/vuejs/babel-plugin-jsx) | Vue 3 JSX 编译插件 |
| [Volar](https://github.com/vuejs/language-tools) | Vue TS / TSX 智能提示插件 |
| [Vue 源码 · apiDefineComponent.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiDefineComponent.ts) | defineComponent 实现 |
| [JSX 在 Vue 中的演进 RFC](https://github.com/vuejs/rfcs/discussions/426) | TSX 类型推导原理 |