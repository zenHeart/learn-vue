# Vue 模板编译错误诊断与修复

## 概述

Vue 模板编译错误发生在模板语法不符合 Vue 规范时。这些错误通常在开发环境通过编译器的错误提示暴露出来。

## 常见错误类型

### 1. 模板语法错误

#### 缺少闭合标签

```vue
<!-- ❌ 错误：未闭合标签 -->
<template>
  <div>
    <span>Hello</span>
  <!-- 缺少 </div> -->
</template>

<!-- ✅ 正确 -->
<template>
  <div>
    <span>Hello</span>
  </div>
</template>
```

#### 标签匹配错误

```vue
<!-- ❌ 错误：标签顺序错误 -->
<template>
  <div>
    <span><div>内容</div></span>
  </div>
</template>

<!-- ✅ 正确：块级元素不能放在行内元素内 -->
<template>
  <div>
    <span>内容</span>
  </div>
</template>
```

### 2. 属性绑定错误

#### 缺少引号

```vue
<!-- ❌ 错误：动态属性值缺少引号 -->
<template>
  <div :class=[activeClass]>内容</div>
</template>

<!-- ✅ 正确：使用引号包裹 -->
<template>
  <div :class="activeClass">内容</div>
</template>
```

#### 错误的绑定语法

```vue
<!-- ❌ 错误：混用插值和属性绑定 -->
<template>
  <div :title="{{ message }}">内容</div>
</template>

<!-- ✅ 正确：只使用属性绑定 -->
<template>
  <div :title="message">内容</div>
</template>
```

### 3. 指令使用错误

#### v-for 错误

```vue
<!-- ❌ 错误：缺少 key -->
<template>
  <ul>
    <li v-for="item in items">{{ item }}</li>
  </ul>
</template>

<!-- ✅ 正确：提供唯一的 key -->
<template>
  <ul>
    <li v-for="(item, index) in items" :key="index">{{ item }}</li>
  </ul>
</template>
```

```vue
<!-- ❌ 错误：v-for 和 v-if 同时使用在同一元素 -->
<template>
  <div v-for="item in items" v-if="item.show">{{ item.name }}</div>
</template>

<!-- ✅ 正确：使用计算属性过滤 -->
<template>
  <div v-for="item in visibleItems" :key="item.id">{{ item.name }}</div>
</template>

<script>
export default {
  computed: {
    visibleItems() {
      return this.items.filter(item => item.show);
    }
  }
}
</script>
```

#### v-model 错误

```vue
<!-- ❌ 错误：在自定义组件上错误使用 v-model -->
<template>
  <!-- Vue 3：需要使用 modelValue prop -->
  <my-component v-model="value"></my-component>
</template>

<!-- ✅ 正确：Vue 3 使用 modelValue 或自定义 prop 名 -->
<template>
  <my-component v-model:title="title"></my-component>
</template>
```

### 4. 事件处理错误

#### 事件修饰符错误

```vue
<!-- ❌ 错误：.stop 和 .prevent 混用 -->
<template>
  <form @submit.stop.prevent="submit">...</form>
</template>

<!-- ✅ 正确：单独使用或正确组合 -->
<template>
  <form @submit.prevent="submit">...</form>
</template>
```

### 5. 插槽相关错误

#### 作用域插槽错误

```vue
<!-- ❌ 错误：忘记传递 slot props -->
<template>
  <my-component>
    <template #default>内容</template>
  </my-component>
</template>

<!-- ✅ 正确：接收并使用 slot props -->
<template>
  <my-component>
    <template #default="{ item }"> {{ item.name }} </template>
  </my-component>
</template>
```

## 编译错误诊断工具

### Vue 3 编译器 API

```js
import { compile } from 'vue';

const { code, errors } = compile(`
  <div>
    <span>{{ message }</span>
  </div>
`);

if (errors.length > 0) {
  console.error('编译错误:', errors);
}
```

### 常见编译器错误信息

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Invalid end tag` | 标签未正确闭合 | 检查模板标签 |
| `Cannot v-for on root element` | v-for 在根元素上 | 使用 template 包装 |
| `v-if/else branches must be adjacent` | v-if/else 不连续 | 确保相邻使用 |
| `Slot props used in v-slot must be from parent` | Slot props 来源错误 | 检查作用域 |

## 开发环境调试

### 使用 Vue DevTools

1. 安装 Vue DevTools 浏览器扩展
2. 打开开发者工具 → Vue 面板
3. 查看组件状态和模板编译结果

### 启用源码映射

确保 `vue.config.js` 中启用了源码映射：

```js
module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  }
}
```

## 最佳实践

1. **使用 Vetur/ESLint/Volar**：IDE 插件可在编写时发现错误
2. **组件单一职责**：简化模板，减少出错可能
3. **模板格式化**：保持模板结构清晰
4. **类型检查**：使用 TypeScript 增强类型安全
5. **测试覆盖**：使用 Jest/Vitest 测试组件渲染

## 参考资料

- [Vue 模板语法文档](https://v3.cn.vuejs.org/api/directives.html)
- [Vue 编译器 API](https://vuejs.org/api/application.html#compile)
- [Vue 错误处理](https://vuejs.org/api/options-state.html#errorhandler)
