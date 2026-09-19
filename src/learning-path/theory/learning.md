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

## 原理 demo 清单

- **02.reactive-mini** — 手写 50 行 reactive / effect / track / trigger；展示 targetMap、cleanup、嵌套 effect 栈。
- **03.computed-lazy** — 手写 computed：lazy + dirty；演示首次访问才求值、与普通 effect 的差异。
- **04.vnode-create** — 解释 patchFlag / dynamicProps / children 类型枚举；手写 `h()` 构造过程。
- **05.diff-patch-keyed** — 同级 keyed 对比算法（双端 + LIS）；可视化头头/尾尾/头尾/尾头 4 个快速路径。
- **06.component-mount** — 组件挂载全流程：`createComponentInstance` → `setupComponent` → `mountComponent`；trace 钩子触发顺序。
- **07.lifecycle-dispatch** — `currentInstance` + 父子组件 mount/unmount 时序；模拟 SSR 下 mounted 跳过。
- **08.inject-traverse** — provide / inject 链路：原型链查找 + shadowing 演示。
- **09.scheduler-priority** — 调度器三队列：queueJob / queuePostFlushCb；同一 job 去重、uid 排序。
- **10.nexttick-microtask** — `Promise.resolve().then` vs MessageChannel；连续修改合并更新。
- **11.sfc-compiler-pipeline** — SFC 编译 parse → transform → generate；可视化每一步产物。
- **12.template-optimize** — 编译期优化：hoistStatic、PatchFlag、Block Tree；输出优化后的 render function。
- **13.hydration-mismatch** — SSR hydration mismatch 警告与恢复策略；与 KeepAlive 嵌套的边界。
- **14.events-handler-cache** — 事件 handler 缓存机制：`events.ts` 中 `_vts` 时间戳 + `invoker.attached` 解决异步递归触发；DOM 上始终是同一 invoker 函数引用。
- **15.async-component-resolution** — `defineAsyncComponent` 的 retry/delay/onError 三阶段；动态 import 失败回退；与 `<Suspense>` 边界关系（`suspensible` 参数）。
