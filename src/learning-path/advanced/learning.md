---
layout: page
aside: false
footer: false
returnToTop: false
---
<script>
import { defineAsyncComponent, onMounted } from 'vue'
import ReplLoading from '@theme/components/ReplLoading.vue'
import { data } from './topic.data'


export default {
  components: {
    LearningPathRepl: defineAsyncComponent({
      loader: () => import('@theme/components/Vue3Repl/index.vue'),
      loadingComponent: ReplLoading
    })
  },
  setup() {
    return {
      data
    }
  }
}
</script>

<ClientOnly>
  <LearningPathRepl :data="data"  />
</ClientOnly>

## 高级 demo 清单

- **16.vue-events-namespace** — 多个事件的命名与监听：`emits: ['save', 'update:value']` 声明，子组件 `$emit`，父组件 `@save` / `@update:value` 监听；v-model 本质。
- **17.props-validation-underscore** — `validatePropName` 静默丢弃 `$` / `_` 开头 prop；type → required → validator 校验顺序；default 工厂函数。
- **18.template-ref-vfor-order** — `ref="elRefs"` 数组按 patch 后 DOM 顺序收集；与 `useTemplateRef` 类型对比；shuffle / reverse 后顺序差异。
- **19.emits-and-onchange-double** — 同时声明 `emits: ['change']` 和读 `props.onChange` 时事件触发两次；纯 emit 正确写法与 Vue 2 兼容写法对比。
- **20.base-transition-duration** — `<Transition :duration="1000">` 数字与 `{enter:500, leave:1500}` 对象形式；CSS class hook 触发顺序；JS 钩子签名。
- **21.compiler-sfc-macro-flow** — `defineProps<T>` / `withDefaults` 是编译期宏；展示编译产物（手写简化版）与运行时默认值生效。
