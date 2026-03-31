# Vue.js 官方 UI 组件库源码分析

> 基于 vuejs/ui 源码，学习 Vue 组件开发最佳实践

> ⚠️ 注意：vuejs/ui 已于 2024 年 2 月归档（read-only），本教程仅供学习参考

---

## 目录

- [项目概览](#项目概览)
- [组件列表](#组件列表)
- [核心设计模式](#核心设计模式)
- [VueButton 深入分析](#vuebutton-深入分析)
- [VueModal 深入分析](#vuemodal-深入分析)
- [VueTabs 深入分析](#vuetabs-深入分析)
- [VueSwitch 深入分析](#vueswitch-深入分析)
- [Mixins 复用模式](#mixins-复用模式)
- [Scoped CSS 技巧](#scoped-css-技巧)
- [最佳实践总结](#最佳实践总结)

---

## 项目概览

### vuejs/ui 架构特点

```
vuejs/ui (归档)
├── src/
│   ├── components/          # Vue 组件
│   │   ├── VueButton.vue
│   │   ├── VueModal.vue
│   │   ├── VueTabs.vue
│   │   └── ...
│   ├── mixins/              # 可复用 mixins
│   │   ├── DisabledChild.js
│   │   ├── DisableScroll.js
│   │   └── CoupledParent.js
│   └── style/               # 全局样式
│       ├── base.styl
│       └── imports.styl
├── package.json
└── README.md
```

### 技术栈

| 技术 | 用途 |
|------|------|
| Vue 2.x | 框架 |
| Stylus | CSS 预处理器 |
| Mixins | 代码复用 |
| provide/inject | 跨层级通信 |
| render function | 函数式组件 |

---

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| VueButton | VueButton.vue | 按钮，支持 loading/icon/tag |
| VueDisable | VueDisable.vue | 禁用状态包装器 |
| VueDropdown | VueDropdown.vue | 下拉菜单 |
| VueDropdownButton | VueDropdownButton.vue | 下拉触发按钮 |
| VueFormField | VueFormField.vue | 表单字段包装 |
| VueGroup | VueGroup.vue | 分组容器 |
| VueGroupButton | VueGroupButton.vue | 分组按钮项 |
| VueIcon | VueIcon.js | 图标组件（函数式） |
| VueInput | VueInput.vue | 输入框 |
| VueLoadingBar | VueLoadingBar.js | 加载进度条 |
| VueLoadingIndicator | VueLoadingIndicator.js | 加载指示器 |
| VueModal | VueModal.vue | 模态框 |
| VueSelect | VueSelect.vue | 选择器 |
| VueSelectButton | VueSelectButton.vue | 选择器触发按钮 |
| VueSwitch | VueSwitch.vue | 开关 |
| VueTab | VueTab.vue | Tab 面板 |
| VueTabs | VueTabs.vue | Tab 容器 |
| VueTypeAhead | VueTypeAhead.vue | 自动补全 |

---

## 核心设计模式

### 1. 动态组件（is）

```vue
<!-- VueButton 中根据属性决定渲染为 button/router-link/a -->
<component
  :is="component"
  v-bind="$attrs"
>
  <!-- 内容 -->
</component>

<script>
computed: {
  component () {
    if (this.$attrs.to) {
      return 'router-link'      // Vue Router 链接
    } else if (this.$attrs.href) {
      return 'a'                 // HTML 锚点
    } else {
      return 'button'            // 默认按钮
    }
  }
}
</script>
```

### 2. v-bind="$attrs"

```vue
<!-- $attrs 包含所有非 prop 传递的属性 -->
<!-- 传递给 <component :is="component"> 自动透传 -->
<component
  :is="component"
  class="vue-ui-button"
  v-bind="$attrs"    <!-- 自动传递 class、disabled、type 等 -->
  @click="handleClick"
/>
```

### 3. $listeners 透传（Vue 2）

```vue
<!-- Vue 2 中 v-on="$listeners" 传递所有事件监听器 -->
<component
  :is="component"
  v-bind="$attrs"
  v-on="$listeners"
/>
```

### 4. provide/inject 跨层级通信

```vue
<!-- VueTabs.vue -->
<script>
export default {
  provide () {
    return {
      VueTabs: {
        data: this.injectedData,
      }
    }
  },
  data () {
    return {
      injectedData: {
        animate: this.animate,
      }
    }
  }
}
</script>

<!-- VueTab.vue 子组件中 -->
<script>
export default {
  inject: ['VueTabs'],
  computed: {
    animate () {
      return this.VueTabs.data.animate
    }
  }
}
</script>
```

---

## VueButton 深入分析

### 组件职责

```
VueButton 职责：
1. 根据 href/to 属性动态渲染为 <a>/<router-link>/<button>
2. 处理 disabled/loading 状态的点击拦截
3. 支持左侧/右侧图标
4. 支持 tag（徽章）显示
```

### 关键实现

```vue
<template>
  <!-- 动态组件：button | router-link | a -->
  <component
    :is="component"
    class="vue-ui-button"
    :class="[{ disabled: finalDisabled, loading, ghost }]"
    v-bind="$attrs"              <!-- 透传非 prop 属性 -->
    :type="type"                 <!-- button 的 type 属性 -->
    :tabindex="ghost ? -1 : 0"  <!-- ghost 时不可聚焦 -->
    role="button"
    @click.capture="handleClick"  <!-- capture 阶段拦截 -->
  >
    <!-- Loading 指示器 -->
    <VueLoadingIndicator v-if="loading" />

    <span class="content">
      <!-- 左侧图标 -->
      <VueIcon v-if="iconLeft" :icon="iconLeft" class="button-icon left" />

      <!-- 默认插槽或 label -->
      <slot>{{ label }}</slot>

      <!-- Tag 徽章 -->
      <span v-if="tag != null" class="tag-wrapper">
        <span class="tag">{{ tag }}</span>
      </span>

      <!-- 右侧图标 -->
      <VueIcon v-if="iconRight" :icon="iconRight" class="button-icon right" />
    </span>
  </component>
</template>

<script>
import DisabledChild from '../mixins/DisabledChild'

export default {
  name: 'VueButton',
  inheritAttrs: false,        <!-- 禁用属性继承，$attrs 生效 -->
  mixins: [DisabledChild],    <!-- 混入 disabled 逻辑 -->

  props: {
    iconLeft: String,
    iconRight: String,
    label: String,
    loading: Boolean,
    loadingSecondary: Boolean,
    type: { type: String, default: 'button' },
    tag: { type: [Number, String], default: null },
  },

  computed: {
    // 动态标签：router-link > a > button
    component () {
      if (this.$attrs.to) return 'router-link'
      if (this.$attrs.href) return 'a'
      return 'button'
    },
    // ghost = disabled + loading → 不可点击
    ghost () {
      return this.finalDisabled || this.loading || this.loadingSecondary
    }
  },

  methods: {
    handleClick (event) {
      if (this.ghost) {
        // 拦截所有冒泡，防止触发任何事件
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
      } else {
        this.$emit('click', event)
      }
    }
  }
}
</script>
```

### 设计亮点

1. **动态标签**：一个组件支持三种 HTML 标签
2. **inheritAttrs: false**：手动控制属性透传
3. **capture 拦截**：在事件 capture 阶段阻止冒泡
4. **mixin 复用**：DisabledChild 处理通用 disabled 逻辑

---

## VueModal 深入分析

### 组件职责

```
VueModal 职责：
1. 全屏遮罩 + 居中弹窗
2. 支持 ESC 关闭（keyboard 交互）
3. 锁定时禁止关闭
4. 自动聚焦弹窗（无障碍）
5. 动画过渡效果
```

### 关键实现

```vue
<template>
  <transition
    name="vue-ui-modal"
    :duration="{ enter: 1000, leave: 300 }"
    appear                        <!-- 初始挂载时也触发动画 -->
  >
    <div
      class="vue-ui-modal"
      :class="{ locked }"
      tabindex="0"                <!-- 可聚焦，响应键盘事件 -->
      role="dialog"
      aria-modal="true"
      @keyup.esc="close()"
    >
      <!-- 遮罩层 -->
      <div class="backdrop" @click="close()" />

      <!-- 弹窗主体 -->
      <div class="shell" @keyup.esc="close()">
        <!-- 头部插槽 -->
        <div class="header">
          <slot name="header">
            <div v-if="title" class="title" v-html="title" />
          </slot>
        </div>

        <!-- 内容插槽 -->
        <div class="body">
          <slot/>
        </div>

        <!-- 底部插槽 -->
        <div class="footer">
          <slot name="footer"/>
        </div>

        <!-- 关闭按钮（非锁定时） -->
        <VueButton
          v-if="!locked"
          class="close-button icon-button flat round"
          icon-left="close"
          @click="close()"
        />
      </div>
    </div>
  </transition>
</template>

<script>
import DisableScroll from '../mixins/DisableScroll'

export default {
  name: 'VueModal',
  mixins: [DisableScroll],   <!-- 混入禁用滚动逻辑 -->

  props: {
    locked: Boolean,          <!-- 锁定时不可关闭 -->
    title: String,
  },

  mounted () {
    // 自动聚焦，便于键盘操作
    this.$nextTick(() => {
      this.$el.focus()
    })
  },

  methods: {
    close () {
      if (!this.locked) {
        this.$emit('close')
      }
    }
  }
}
</script>
```

### 动画实现

```stylus
// 入场动画
.vue-ui-modal-enter-active,
.vue-ui-modal-leave-active
  > .backdrop
    transition opacity .3s
  > .shell
    transition opacity .3s, transform .3s cubic-bezier(0.0, 0.0, 0.2, 1)
    // 退场：scale(.95) + opacity 0
  > .shell
    > .body, > .footer
      transition transform .8s cubic-bezier(0, 1, 0, 1), opacity .15s

// 入场：从下方滑入 + opacity
.vue-ui-modal-enter
  > .shell
    > .body, > .footer
      opacity 0
      transform translateY(-20px)

// 退场：scale(.95) + opacity 0
.vue-ui-modal-leave-to
  > .backdrop, > .shell
    opacity 0
  > .shell
    transform scale(.95)
```

---

## VueTabs 深入分析

### 组件职责

```
VueTabs 职责：
1. 管理多个 VueTab 子组件
2. 耦合通信（CoupledParent mixin）
3. 键盘导航（←/→ 切换）
4. 动画方向控制（向左/向右滑）
5. provide/inject 向子组件传递配置
```

### 关键实现

```vue
<template>
  <div class="vue-ui-tabs" :class="[`direction-${direction}`]">
    <!-- 分组按钮区域 -->
    <VueGroup
      v-model="currentTabId"
      class="tabs"
      :indicator="!groupNoIndicator"
    >
      <VueGroupButton
        v-for="(tab, index) of children"
        :key="tab.id"
        :value="tab.id"
        :label="tab.label"
        :icon-left="tab.icon"
        :disabled="tab.disabled"
        role="tab"
        @keyup.native.left="activateChild(index - 1)"
        @keyup.native.right="activateChild(index + 1)"
      />
    </VueGroup>

    <!-- Tab 内容区域 -->
    <div class="tabs-content">
      <slot/>
    </div>
  </div>
</template>

<script>
import CoupledParent from '../mixins/CoupledParent'

export default {
  name: 'VueTabs',

  // provide 向后代组件传递数据
  provide () {
    return {
      VueTabs: {
        data: this.injectedData,
      }
    }
  },

  mixins: [
    CoupledParent('VueTabsCoupling'),  // 管理子组件注册
  ],

  props: {
    animate: Boolean,
    tabId: { type: [String, Number], default: null },  // v-model
  },

  data () {
    return {
      currentTabId: this.tabId,
      direction: 'to-right',        // 控制动画方向
      injectedData: { animate: this.animate }
    }
  },

  watch: {
    animate (value) {
      this.injectedData.animate = value
    },
    currentTabId (value, oldValue) {
      // 计算动画方向
      const index = this.findTabIndex(value)
      const oldIndex = this.findTabIndex(oldValue)
      this.direction = index < oldIndex ? 'to-left' : 'to-right'
      // 同步 v-model
      if (value !== this.tabId) {
        this.$emit('update:tabId', value)
      }
    }
  },

  methods: {
    activateChild (index, external) {
      // 切换到指定索引的 Tab
      const child = this.children[index]
      if (child) {
        this.$emit('update:tabId', child.id)
      }
    }
  }
}
</script>
```

### CoupledParent Mixin

```js
// 管理子组件注册/激活的机制
export default {
  provide () {
    return {
      [this couplingKey]: {
        register: this.registerChild,
        activate: this.childActivated,
      }
    }
  },

  data () {
    return {
      children: [],  // 注册的子组件列表
      activeChildIndex: -1,
    }
  },

  methods: {
    registerChild (child) {
      this.children.push(child)
      // 自动激活第一个
      if (this.children.length === 1) {
        this.childActivated(0, -1, true)
      }
    },
    childActivated (index, oldIndex, external) {
      this.activeChildIndex = index
    }
  }
}
```

---

## VueSwitch 深入分析

### 组件职责

```
VueSwitch 职责：
1. v-model 双向绑定（使用 update 事件）
2. disabled 状态处理
3. 键盘操作（Enter/Space 切换）
4. 无障碍属性（role="checkbox"）
```

### 关键实现

```vue
<template>
  <div
    class="vue-ui-switch"
    :class="{ selected: value, disabled: finalDisabled, focus: focused }"
    :tabindex="disabled ? -1 : 0"
    role="checkbox"
    :aria-disabled="disabled"
    :aria-checked="!!value"
    @click="toggleValue"
    @keydown.enter="focused = true; toggleValue($event)"
    @keydown.space="focused = true; toggleValue($event)"
    @blur="focused = false"
  >
    <div class="content">
      <span class="slot"><slot/></span>
      <div class="wrapper">
        <div class="bullet"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VueSwitch',

  // Vue 2：v-model 语法糖
  model: {
    event: 'update',
  },

  mixins: [DisabledChild],

  props: {
    value: {},       // v-model 绑定值
  },

  data () {
    return { focused: false }
  },

  computed: {
    // 双向绑定的 getter/setter
    valueModel: {
      get () { return this.value },
      set (value) { this.$emit('update', value) }  // 对应 model.event
    }
  },

  methods: {
    toggleValue () {
      if (this.finalDisabled) return
      this.valueModel = !this.valueModel
    }
  }
}
</script>
```

### 设计亮点

1. **自定义 v-model 事件名**：`model.event: 'update'` 允许自定义事件名
2. **computed 双向绑定**：getter/setter 实现 `valueModel`
3. **focused 状态追踪**：键盘操作时追踪 focus 状态
4. **无障碍**：`role="checkbox"` + `aria-checked`

---

## Mixins 复用模式

### DisabledChild

```js
// 处理 disabled 逻辑的通用 mixin
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    }
  },

  computed: {
    finalDisabled () {
      // 可被子类覆盖或扩展
      return this.disabled
    }
  }
}
```

### DisableScroll

```js
// 禁用页面滚动的 mixin（Modal 使用）
export default {
  mounted () {
    document.body.style.overflow = 'hidden'
  },

  beforeDestroy () {
    document.body.style.overflow = ''
  }
}
```

### CoupledParent

```js
// 父子组件耦合通信的通用模式
// 用于 Tabs/Dropdown 等需要管理子组件列表的场景
export default {
  data () {
    return {
      children: [],
      activeChildIndex: -1,
    }
  },

  methods: {
    registerChild (child) { /* ... */ },
    childActivated (index) { /* ... */ },
  }
}
```

---

## Scoped CSS 技巧

### 1. 深色模式支持

```stylus
.vue-ui-modal
  background $vue-ui-white

  .vue-ui-dark-mode &          // 父元素有 .vue-ui-dark-mode 时生效
    background $vue-ui-gray-900
```

### 2. CSS 变量动态切换

```stylus
// 定义主题色
colors($dark, $light, $invert = false)
  if $invert
    $foreground = $light
    $background = $dark
  else
    $foreground = $dark
    $background = $light
  button-colors($foreground, $background)
```

### 3. 混合器（Mixins）抽象

```stylus
// 居中布局
h-box()
  display flex

box-center()
  align-items center
  justify-content center

// 使用
.content
  h-box()
  box-center()
```

---

## 最佳实践总结

### 1. 组件设计原则

| 原则 | 应用 |
|------|------|
| 单一职责 | 每个组件只做一件事 |
| 插槽扩展 | 用 slot 而非 props 传递 UI |
| 属性透传 | v-bind="$attrs" 避免手动传递 |
| mixin 复用 | 公共逻辑抽取到 mixin |
| 动态组件 | :is 实现多标签支持 |

### 2. 无障碍（Accessibility）

```vue
<!-- 语义化 HTML -->
<button> 而非 <div role="button">

<!-- ARIA 属性 -->
role="checkbox"
:aria-checked="!!value"
:aria-disabled="disabled"
aria-modal="true"

<!-- 键盘支持 -->
@keyup.esc="close"
tabindex="0"
```

### 3. 事件处理

```vue
<!-- capture 阶段拦截 -->
@click.capture="handleClick"

<!-- 阻止传播 -->
event.stopPropagation()
event.stopImmediatePropagation()

<!-- 阻止默认行为 -->
event.preventDefault()
```

### 4. v-model 最佳实践

```js
// Vue 2 自定义 v-model
model: {
  event: 'update',
},

computed: {
  valueModel: {
    get () { return this.value },
    set (value) { this.$emit('update', value) }
  }
}
```

### 5. CSS 架构

```stylus
// 1. 基础变量
@import "../style/base"

// 2. 布局混合器
h-box()        // 水平 flex
v-box()        // 垂直 flex

// 3. 颜色主题
.dark-mode &
  background $vue-ui-gray-900

// 4. 过渡动画
transition all .3s cubic-bezier(0.0, 0.0, 0.2, 1)
```

---

## 相关资源

- vuejs/ui 归档仓库: https://github.com/vuejs/ui
- Vue 官方组件库: https://github.com/vuejs/components
- Vue 2 组件开发指南: https://vuejs.org/v2/guide/components.html
- Vue 2 渲染函数: https://vuejs.org/v2/guide/render-function.html
