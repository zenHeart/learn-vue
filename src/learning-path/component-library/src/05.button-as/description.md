> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: PolymorphicComponent 多态组件

# 05 · 多态组件（Polymorphic `as`）

## 你会学到什么

Element Plus 的 `<el-button :tag="'a'">`、Reka UI 的 `<Primitive as="a">`、
Headless UI 的 `<MenuButton as={RouterLink}>` 都是多态组件 —— 一个组件
可渲染成任意 HTML 元素或第三方组件，而 props 自动按目标元素推断。

本 demo 实现：

- TS 强类型 `as` —— 传 `as="a"` 自动启用 `href`、`target`，传 `as="router-link"` 自动启用 `to`
- TSX 渲染 —— `<component :is="tag" v-bind="mergedProps">`
- 类型守卫 —— `as` 是 string 时 vs Component 时分别处理

## 真实场景（抽象）

> "我希望 `<AppButton>` 在表格里是 `<button>`，
> 在导航里是 `<router-link>`，在卡片里是 `<a>`。
> 但 props 一直叫 `variant` / `size` / `disabled`，不变成 `<a>` 后多出 `href` 等。"

答：用 `<component :is>` + 强类型 polymorphic。这是 Element Plus 自 v2.2 起
`<el-button>` 的实现，也是 Reka UI 的 `Primitive` 全部套路。

## 动手试

1. 默认渲染为 `<button>` —— 看 native 行为（无跳转）
2. 切到 `<a>` —— 自动暴露 `href`，点击可跳转
3. 切到 `<router-link>`（mock） —— 自动暴露 `to`，点击不刷新页面
4. 切到 `<div>` —— 不接受 `href`，TS 推断会报错（演示见代码注释）

## 关键模式

### 动态 tag + props 透传

```vue
<component
  :is="tag"
  v-bind="$attrs"
  :class="['btn', `btn--${variant}`]"
  @click="handleClick"
>
  <slot />
</component>
```

### TS 强类型 polymorphic

```ts
// 思路：当 as 是字符串时，启用对应元素 HTML 属性
type ButtonPolymorphicProps<T extends ElementType> = {
  as?: T
  variant?: 'primary' | 'default'
} & ComponentPropsWithoutRef<T>   // 把 as 对应的元素 props 都接受

// 用法：<AppButton as="a" href="..." />  自动推断 href 类型
```

### Reka UI 的 Primitive 范式

```ts
// Reka UI：<Primitive as="div" asChild> 直接包你的元素
<Button asChild>
  <RouterLink to="/home">Home</RouterLink>
</Button>
```

`asChild` 模式 —— 把样式 + 行为传给子元素，不额外包一层 div。
Reka UI 大量使用，Element Plus 不使用。

## 对比

| 库 | 范式 | 类型推断 | `asChild` 支持 |
|----|------|----------|----------------|
| Element Plus | `<el-button :tag="...">` | 弱（无 TS 推断） | 否 |
| Reka UI | `<Primitive as>` | 强（泛型） | ✓ |
| Radix UI（React） | `<asChild>` | 强（泛型） | ✓ |
| Headless UI（Vue） | `<MenuButton as>` | 强 | ✓ |
| Mantine | `<Box component>` | 强 | 否 |

## TS 类型陷阱

1. **ElementType 与 Component 类型边界**：
   - `<AppButton as="a" href="...">` —— `a` 是字符串，`href` 是 HTML 属性
   - `<AppButton as={MyLink} to="...">` —— `MyLink` 是组件，`to` 是 prop
2. **fallback**：`as` 默认应是 `'button'`，避免漏写时渲染成 `<div>`
3. **事件名**：`onClick` 在 `<a>` 上能 native 触发，在 `<div>` 上不会触发 —— 用 `v-bind="$attrs"` 让用户自己决定

## 常见陷阱

1. **样式作用目标不一致**：`btn` 类通常写在 button 上；`as="a"` 后样式未必生效
2. **`disabled` 行为差异**：`<a>` 不支持 `disabled` 属性，要用 `aria-disabled` + 拦截 click
3. **类型推断深度**：要支持任意用户组件，需要 ComponentPropsWithoutRef

## 延伸阅读

- [Element Plus Button source](https://github.com/element-plus/element-plus/blob/dev/packages/components/button/src/button.vue)
- [Reka UI Primitive](https://reka-ui.com/docs/utilities/primitive)
- [Radix UI asChild](https://www.radix-ui.com/primitives/docs/guides/composition)

## 下一步

06 · 虚拟滚动列表 —— 多态解决元素变换，
06 教你如何处理万行 DOM 的性能问题。
