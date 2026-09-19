> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: 主题系统与 CSS 变量

# 03 · CSS 变量主题系统（Naive UI 范式）

## 你会学到什么

Naive UI 的核心创新是把「设计 token」映射成 CSS 自定义属性（`--n-*`），
运行时通过 `useThemeVars()` 暴露，组件 inline `:style` 注入。
这样：

- 切换主题 = 改一组 CSS 变量
- SSR 一致 = token 在 server / client 都计算一次，hydrate 不闪
- 用户覆盖 = 一行 CSS 即可

本 demo 实现迷你版：

- `createTheme(overrides)` —— 合并默认 token 与覆盖
- `useThemeVars()` —— 读当前主题的扁平化 CSS 变量对象
- 主题切换器 —— 直接修 CSS 变量而不重渲组件

## 真实场景（抽象）

「我们的产品支持白天 / 夜间 / 高对比度三套主题，要求毫秒级切换、
不能重新计算整棵组件树。」

CSS 变量方案的最强场景。SCSS / CSS-in-JS 主题切换做不到这点的。

## 动手试

1. 切「默认 / 暗色 / 高对比度」三个 preset —— 整个区域无重渲，只换 token
2. 点「随机覆盖 primary」 —— 验证 user override 优先级最高
3. 在浏览器 DevTools 看 `--c-primary` 的实时变化

## 关键模式

### Token 表 + 覆盖合并

```ts
const baseTheme = {
  primary:        '#42b883',
  primaryHover:   '#5cc496',
  textBase:       '#213547',
  bgBase:         '#ffffff',
  radiusBase:     '6px',
}

function createTheme(overrides = {}) {
  // Naive UI 风格：shallow merge + 计算衍生色（这里略）
  return { ...baseTheme, ...overrides }
}
```

### 扁平化为 CSS 变量对象

```ts
function themeToCssVars(theme, prefix = '--c') {
  return Object.fromEntries(
    Object.entries(theme).map(([k, v]) => [`${prefix}-${camelToKebab(k)}`, v])
  )
}
```

### 组件 inline style 注入

```vue
<button :style="cssVars" class="btn">按钮</button>
<!-- 等价于 style="--c-primary:#42b883; --c-bg-base:#fff; ..." -->
```

```css
.btn { background: var(--c-primary); color: var(--c-bg-base); border-radius: var(--c-radius-base); }
.btn:hover { background: var(--c-primary-hover); }
```

主题切换时只改根节点的 `--c-*`，所有组件自然联动。

## 对比

| 维度 | Naive UI（CSS 变量） | Element Plus（SCSS 变量） | Ant Design（less + 算法） |
|------|---------------------|--------------------------|--------------------------|
| 切换代价 | O(1) 改根节点变量 | 重新编译 SCSS / 整页重渲 | 重新生成 less / 切 class |
| SSR 一致 | 完美（token 即 inline style） | 需 `<style>` 双注入 | 通过 cssinjs |
| 用户覆盖 | 一行 CSS | 需覆盖类名选择器 | 需覆盖 token |
| 动态主题 | 强（运行时换 token） | 弱 | 中 |
| 包体积 | 共享一份 CSS | 每个主题一份 CSS | 每个主题一份 CSS |

## 适用场景

- C 端、用户可换肤
- 暗色模式
- 多品牌（同一套组件库，不同客户主题）
- 高对比度 / 无障碍需求

## 常见陷阱

1. **token 命名一致性**：用 camelCase 还是 kebab-case 全局统一
2. **派生色算法**：`primaryHover` 应基于 `primary` 计算（Naive UI 内部有色相算法）
3. **SSR 与 inline style**：确保 server 渲染的 `style` 属性与 client 一致，否则 hydration mismatch

## 延伸阅读

- [Naive UI 主题源码](https://github.com/tusen-ai/naive-ui/blob/main/src/_mixins/use-theme.ts)
- [VueUse createGlobalState](https://vueuse.org/shared/createGlobalState/)
- [MDN CSS 自定义属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/--*)

## 下一步

04 · Form / FormItem context 注入 —— 主题解决视觉，04 解决跨组件的数据流。
