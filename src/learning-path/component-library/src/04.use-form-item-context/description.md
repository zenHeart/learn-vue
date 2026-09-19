> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: Form 表单上下文注入

# 04 · `useFormItemContext` 多层嵌套 context 注入

## 你会学到什么

Ant Design Vue / Element Plus 的 Form / FormItem 是一对**三层嵌套的 context**：

```
<Form>             ← 提供 FormContext（rules / model / labelAlign…）
  <FormItem>       ← 提供 FormItemContext（field / validate…）
    <Input />      ← 同时 inject FormContext 和 FormItemContext
  </FormItem>
</Form>
```

子组件通过 `inject(formItemContextKey)` 同时拿到两层 context，
触发校验、读 model 值、关联 label-for 的 id 关联。

本 demo 复刻这个机制，并演示：

- 多个 InjectionKey 拆分（FormContext vs FormItemContext）
- 嵌套 Form / FormItem 的 context 合并
- 子组件如何**同时 inject 两个 context**而不互相覆盖
- 「无 Pinia 集中 store」的轻量 form state 模式

## 真实场景（抽象）

「我们的表单跨 12 个字段，分布在 3 个子组件里，
校验和 model 必须由父级 Form 统一管理，
不想为了一个表单上 Pinia。」

答：用 provide/inject + 两个 context key。比 Vuex / Pinia 轻量，
又比 props 穿透省心。

## 动手试

1. 输入框失焦 —— 触发该 FormItem 的 validate 链路
2. 点「整体校验」 —— 看 Form 如何聚合所有 FormItem 的状态
3. 点「动态增删 FormItem」 —— 观察新增 / 卸载时 Form 状态自动同步

## 关键模式

### 两个 InjectionKey 分离职责

```ts
const formContextKey = Symbol('formContext')           // rules, model, labelAlign
const formItemContextKey = Symbol('formItemContext')   // field, validate, inputIds

const useFormItem = () => {
  const form = inject(formContextKey, undefined)
  const formItem = inject(formItemContextKey, undefined)
  return { form, formItem }
}
```

### FormItem 注册到 Form

```ts
// FormItem.setup()
const formItem = reactive({ field, validate, addInputId, removeInputId })
provide(formItemContextKey, formItem)
onMounted(() => form?.addField(formItem))   // 把自己挂到父 Form
onUnmounted(() => form?.removeField(formItem))
```

### 子组件（如 Input）双 inject

```ts
// Input.setup()
const { form, formItem } = useFormItem()
const inputId = computed(() => formItem?.inputIds?.[0])
// 失焦时通过 formItem.validate() 走链
```

## 对比

| 库 | context 层数 | 校验触发 | model 同步 |
|----|-------------|----------|-----------|
| Ant Design Vue | 3（ConfigProvider / Form / FormItem） | FormItem 内 trigger | `v-model:form` |
| Element Plus | 3（ConfigProvider / Form / FormItem） | el-form-item `rules` prop | `v-model` + `prop` |
| Naive UI | 2（n-form / n-form-item） | form-item `rule` | `v-model:modelValue` |
| Vuetify | 3（v-form / v-form-item / rules） | VeeValidate 桥接 | `v-model` |

## 与 Pinia 对比

| 维度 | provide/inject | Pinia store |
|------|----------------|-------------|
| 跨组件共享 | 仅树状祖先-后代 | 全局 |
| 多个表单隔离 | 自动（每个 Form 自带 context） | 需手动 scope |
| 响应式 | ✓ computed / watch | ✓ ref / reactive |
| DevTools | ✗ | ✓ |
| SSR | ✓ | 需手动 hydration |
| 学习成本 | 低 | 中 |

适用场景：
- 一个页面只有一个表单、且天然父子嵌套 → provide/inject 完胜
- 跨路由共享 form 状态 / 步骤式表单 → Pinia

## 常见陷阱

1. **`provide` 默认值**：第二个参数是默认值（避免祖先不存在时崩）
2. **`reactive` vs `ref`**：context 通常 `reactive`，因为字段多
3. **FormItem 销毁时移除自己**：否则 Form 状态残留，导致「校验幽灵字段」
4. **`addInputId` / `removeInputId`**：用 id 数组关联 label-for，不要用 ref 直挂

## 延伸阅读

- [Element Plus useFormItem 实现](https://github.com/element-plus/element-plus/blob/dev/packages/components/form/src/hooks/use-form-item.ts)
- [Ant Design Vue Form 源码](https://github.com/ant-design/ant-design-vue/tree/master/components/form)
- [Vue 官方：依赖注入](https://cn.vuejs.org/guide/components/provide-inject.html)

## 下一步

05 · 多态组件（Polymorphic `as`） —— 看完 context 共享数据，
05 教你让组件按 `as` 切换渲染元素并保持 TS 类型推断。
