# Vue 组件未显示问题排查指南

## 目录

1. [概述](#概述)
2. [组件不显示排查流程图](#组件不显示排查流程图)
3. [渲染条件检查](#渲染条件检查)
4. [父子组件传参问题](#父子组件传参问题)
5. [响应式数据问题](#响应式数据问题)
6. [调试工具和技巧](#调试工具和技巧)
7. [常见问题汇总表](#常见问题汇总表)

---

## 概述

Vue 组件在开发过程中可能出现各种"不显示"的问题，本文提供系统化的排查方法，帮助开发者快速定位问题根源。

---

## 组件不显示排查流程图

```
组件未显示？
    │
    ├─► 检查 DOM 是否存在
    │       │
    │       ├─► DOM 存在 → 检查 CSS 样式（visibility/display/opacity）
    │       │
    │       └─► DOM 不存在 → 检查渲染条件
    │
    ├─► 检查组件是否正确挂载
    │       │
    │       ├─► 查看 Vue DevTools 组件树
    │       │       │
    │       │       ├─► 组件在树中 → 检查 v-if/v-show 条件
    │       │       │
    │       │       └─► 组件不在树中 → 检查组件注册和引入
    │       │
    │       └─► 检查控制台错误
    │
    └─► 检查数据响应式
            │
            ├─► 数据是否正确声明（ref/reactive）
            ├─► 数据是否在 setup return 中暴露
            └─► 是否修改了未声明的属性
```

### 快速检查清单

| 步骤 | 检查项 | 快速验证方法 |
|------|--------|-------------|
| 1 | 组件是否注册 | DevTools 组件树查找 |
| 2 | 渲染条件是否为真 | 检查 v-if 表达式 |
| 3 | CSS 是否隐藏元素 | 浏览器开发者工具审查元素 |
| 4 | Props 是否正确传递 | DevTools props 面板 |
| 5 | 数据是否响应式 | 检查 reactive 对象结构 |

---

## 渲染条件检查

### v-if vs v-show 区别

| 特性 | v-if | v-show |
|------|------|--------|
| 原理 | 条件渲染（DOM 添加/移除） | CSS display 属性切换 |
| 初始性能 | 惰性（条件为 false 时不渲染） | 非惰性（始终渲染） |
| 切换开销 | 高（频繁切换时） | 低（仅切换 CSS） |
| 支持 template | 是 | 否 |

**示例对比**：

```vue
<!-- v-if：条件为 false 时完全不渲染 DOM -->
<div v-if="show">条件渲染</div>

<!-- v-show：始终渲染，仅通过 display: none 隐藏 -->
<div v-show="show">CSS 隐藏</div>
```

### 常见渲染条件问题

**1. 组件注册问题（最常见）**

```vue
<!-- ❌ 错误：未注册组件 -->
<template>
  <MyComponent />  <!-- 控制台无报错，但组件不显示 -->
</template>

<!-- ✅ 正确：局部注册 -->
<script>
import MyComponent from './MyComponent.vue'
export default {
  components: { MyComponent }
}
</script>

<!-- ✅ 正确：全局注册（在 main.js） -->
app.component('MyComponent', MyComponent)
```

**2. 名称拼写错误**

```vue
<!-- ❌ 错误：组件名不匹配 -->
<Mycomponent />  <!-- 期望 my-component -->

<!-- ✅ 正确：使用短横线命名 -->
<my-component />
```

### CSS 隐藏问题

**1. visibility: hidden**

```css
/* 元素占据空间但不可见 */
.hidden {
  visibility: hidden;
}
```

**2. display: none**

```css
/* 元素不占据空间，完全不渲染 */
.hidden {
  display: none;
}
```

**3. opacity: 0**

```css
/* 透明但可交互 */
.invisible {
  opacity: 0;
}
```

**排查方法**：

1. 打开浏览器开发者工具
2. 定位目标元素
3. 在 Elements 面板检查 computed 样式
4. 查找是否有 `display: none`、`visibility: hidden` 或 `opacity: 0`

---

## 父子组件传参问题

### Props 传递问题

**1. Props 未定义或类型错误**

```vue
<!-- 子组件 -->
<script>
export default {
  props: {
    // ❌ 错误：未定义 title
    // 模板中使用 this.title 会导致警告
  },
  template: '<div>{{ title }}</div>'
}

// ✅ 正确：定义 props
props: {
  title: {
    type: String,
    required: true
  }
}
</script>
```

**2. Props 传递为 undefined**

```vue
<!-- 父组件 -->
<template>
  <!-- ❌ 错误：item 可能为 undefined -->
  <ChildComponent :data="item.name" />

  <!-- ✅ 正确：使用可选链 -->
  <ChildComponent :data="item?.name" />

  <!-- ✅ 正确：提供默认值 -->
  <ChildComponent :data="item?.name || '默认名称'" />
</template>
```

### Provide/Inject 问题

**1. 注入的响应式问题**

```vue
// 父组件
export default {
  provide() {
    return {
      // ❌ 错误：普通值不是响应式的
      count: this.count
    }
  }
}

// ✅ 正确：使用 ref 或 reactive 保持响应性
provide() {
  return {
    count: computed(() => this.count)
  }
}
```

### Slots 插槽问题

**1. 插槽内容未显示**

```vue
<!-- 子组件 -->
<template>
  <div>
    <slot>后备内容</slot>  <!-- 检查是否正确使用 slot -->
  </div>
</template>

<!-- 父组件 -->
<template>
  <ChildComponent>
    <template #default>插槽内容</template>  <!-- 检查是否正确传递插槽 -->
  </ChildComponent>
</template>
```

---

## 响应式数据问题

### Vue 2 响应式问题

**1. 对象属性添加**

```javascript
// ❌ 错误：直接添加的属性不是响应式的
this.user.name = 'John'  // OK
this.user.age = 25        // NOT OK - 不会触发更新

// ✅ 正确：使用 Vue.set
Vue.set(this.user, 'age', 25)

// ✅ 正确：使用替换对象
this.user = { ...this.user, age: 25 }
```

**2. 数组索引设置**

```javascript
// ❌ 错误
this.items[0] = newValue  // 不触发更新

// ✅ 正确
Vue.set(this.items, 0, newValue)
// 或
this.items.splice(0, 1, newValue)
```

### Vue 3 响应式问题

**1. ref vs reactive 选择**

```javascript
// ❌ 常见错误：解构 reactive 对象
const state = reactive({ count: 0 })
const { count } = state  // count 失去响应式

// ✅ 正确：使用 toRefs
import { toRefs } from 'vue'
const { count } = toRefs(state)  // 保持响应式
```

**2. setup 中 this 指向**

```javascript
export default {
  setup(props, context) {
    // ❌ 错误：在 setup 中使用 this.count
    // setup 中的 this 不指向组件实例

    // ✅ 正确：直接访问 props
    console.log(props.title)

    // ✅ 正确：使用 context
    console.log(context.emit)
  }
}
```

### 常见响应式问题排查

| 问题现象 | 可能原因 | 解决方法 |
|---------|---------|---------|
| 界面不更新 | 修改了非响应式属性 | 使用 ref/reactive |
| 界面不更新 | 直接修改数组索引 | 使用 splice 或 Vue.set |
| 界面不更新 | 解构了 reactive 对象 | 使用 toRefs |
| 界面不更新 | async 函数中修改状态 | 在 nextTick 后修改 |

---

## 调试工具和技巧

### Vue DevTools 使用

**1. 检查组件树**

- 打开 DevTools → Components 面板
- 查找目标组件是否在树中
- 检查组件的 `data` 和 `props`

**2. 检查 Props 传递**

- 选中目标组件
- 查看右侧面板的 Props 详情
- 验证 props 值是否正确

**3. 检查响应式状态**

- 使用 Timeline 追踪状态变化
- 查看哪些数据发生了变化

### 浏览器开发者工具

**1. 检查 DOM 元素**

```javascript
// 在控制台中查找组件实例
$vm0  // Vue 2: 当前选中元素的 Vue 实例
$0.__vueParentComponent  // Vue 3: 元素对应的组件实例
```

**2. 强制更新**

```javascript
// 手动触发更新（调试用）
$forceUpdate()  // Vue 2
// Vue 3: 重新赋值响应式数据
```

### 控制台调试技巧

```javascript
// 在 render 函数中打印
render() {
  console.log('render called', this.show)
  return h('div', this.show ? 'visible' : 'hidden')
}

// 监听响应式变化
watchEffect(() => {
  console.log('count changed:', count.value)
})
```

---

## 常见问题汇总表

### 组件相关问题

| 问题描述 | 可能原因 | 解决方法 |
|---------|---------|---------|
| 组件不显示 | 未正确注册 | 局部注册或全局注册组件 |
| 组件不显示 | 组件名拼写错误 | 检查 kebab-case 命名 |
| 组件不显示 | 条件为 false | 检查 v-if 条件值 |
| 控制台警告 | 组件 name 不匹配 | 检查组件 name 选项 |

### 样式相关问题

| 问题描述 | 可能原因 | 解决方法 |
|---------|---------|---------|
| 元素可见但空白 | CSS 隐藏 | 检查 display/visibility/opacity |
| 元素占据空间但不显示 | visibility: hidden | 改为 visibility: visible |
| 元素透明 | opacity: 0 | 设置 opacity: 1 |

### 数据相关问题

| 问题描述 | 可能原因 | 解决方法 |
|---------|---------|---------|
| 数据不更新 | 修改了非响应式属性 | 使用 reactive/ref |
| 数据不更新 | 在异步中修改 | 使用 nextTick |
| 数据不更新 | 解构 reactive | 使用 toRefs |
| 界面闪烁后消失 | v-if 条件不稳定 | 检查条件依赖的数据 |

### Props/Slots 相关问题

| 问题描述 | 可能原因 | 解决方法 |
|---------|---------|---------|
| Props 为 undefined | 父组件未传递 | 检查父组件模板 |
| Props 显示默认值 | 类型不匹配 | 检查 props 类型定义 |
| 插槽内容不显示 | 未正确使用 slot | 检查 slot 标签 |
| 作用域插槽数据空 | 传递方式错误 | 检查 #default 语法 |

### 排查流程总结

```
遇到组件不显示时，按以下顺序检查：

1. 【DOM 检查】浏览器开发者工具 Elements 面板
   └─► DOM 是否存在？

2. 【CSS 检查】Elements 面板 Computed 样式
   └─► 是否有 display: none / visibility: hidden / opacity: 0？

3. 【组件树检查】Vue DevTools Components 面板
   └─► 组件是否在树中？

4. 【注册检查】组件是否正确 import 和 register？

5. 【条件检查】v-if/v-show 条件是否为 true？

6. 【Props 检查】DevTools props 面板值是否正确？

7. 【数据检查】响应式数据是否正确声明和修改？

8. 【控制台检查】是否有错误或警告信息？
```

---

## 相关文档

- [Vue 组件基础](./component.md)
- [Vue 插槽指南](./slot.md)
- [Vue 响应式原理](../theory/3.reactive.md)
- [Vue Composition API](../composition-api.md)
