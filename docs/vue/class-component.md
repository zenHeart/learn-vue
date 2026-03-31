# Vue Class Component

## 概述

Vue Class Component 是 Vue 2 中使用 Class 语法编写组件的方式，通过 `@Options` 装饰器声明选项。

> ⚠️ **已废弃**：Vue 3 推荐使用 Composition API + `<script setup>`，Class Component 在 Vue 3 中仅作兼容使用。

## 基本用法

### 安装

```bash
npm install vue-class-component@8 --save
# Vue 3 兼容版本
npm install @harbor01/vue3-class-component
```

### 定义组件

```ts
import { Component, Vue } from 'vue-class-component'

@Component({
  components: { ChildComponent },
  props: {
    title: String
  }
})
export default class MyComponent extends Vue {
  // 组件状态
  message = 'Hello'

  // 计算属性
  get reversedMessage() {
    return this.message.split('').reverse().join('')
  }

  // 方法
  greet() {
    return `Hello ${this.message}`
  }

  // 生命周期
  mounted() {
    console.log('Component mounted')
  }
}
```

## 装饰器

### @Component

声明组件选项（props、components、mixins 等）。

```ts
@Component({
  props: {
    initialCount: {
      type: Number,
      default: 0
    }
  }
})
```

### @Prop

声明 Props（需安装 `vue-property-decorator`）：

```ts
import { Prop } from 'vue-property-decorator'

@Prop({ required: true })
name!: string

@Prop(Number)
count?: number
```

### @Watch

监听变化：

```ts
import { Watch } from 'vue-property-decorator'

@Watch('count', { immediate: true })
onCountChange(newVal: number) {
  console.log('count changed:', newVal)
}
```

### @Emit

触发事件：

```ts
import { Emit } from 'vue-property-decorator'

@Emit('update')
onUpdate(value: string) {
  return value  // 返回值作为 payload
}
```

## Class Component vs Composition API

| 特性 | Class Component | Composition API |
|------|----------------|-----------------|
| 语法 | TypeScript Class | `setup()` 函数 |
| 逻辑复用 | Mixins | Composables |
| 类型推断 | 天然支持 | 需额外配置 |
| 状态共享 | Mixins | `provide/inject` + Composables |
| Vue 3 兼容 | 有限支持 | 官方推荐 |
| 未来发展 | 停止维护 | 活跃开发 |

## 迁移到 Composition API

### before

```ts
@Component({ props: ['count'] })
export default class Counter extends Vue {
  count!: number
  doubleCount = computed(() => this.count * 2)
}
```

### after

```ts
<script setup lang="ts">
const props = defineProps<{ count: number }>()
const doubleCount = computed(() => props.count * 2)
</script>
```

## 适用场景

- **遗留代码维护**：Vue 2 项目中已有的 Class Component
- **快速原型**：简单组件的快速编写
- **团队习惯**：团队熟悉 Class 语法

**不推荐**：新项目直接用 Composition API。

## 参考

- [vue-class-component 官方文档](https://class-component.vuejs.org/)
- [Vue 3 Class Component 兼容版](https://github.com/Haixing-Hu/vue3-class-component)
- [Vue Composition API 官方文档](https://vuejs.org/guide/extras/composition-api-faq.html)
