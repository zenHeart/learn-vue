<script setup lang="ts">
import { ref, computed } from 'vue'

/* ============================================================
 * 极简 createComponentInstance / setupComponent / mountComponent
 * 仿 packages/runtime-core/src/component.ts 与 renderer.ts
 * ============================================================ */

const enum ComponentLifecycle {
  BEFORE_CREATE = 'beforeCreate',
  CREATED = 'created',
  BEFORE_MOUNT = 'beforeMount',
  MOUNTED = 'mounted',
  BEFORE_UPDATE = 'beforeUpdate',
  UPDATED = 'updated',
  BEFORE_UNMOUNT = 'beforeUnmount',
  UNMOUNTED = 'unmounted'
}

interface ComponentInstance {
  uid: number
  type: { name: string; setup?: (...a: any[]) => any; render?: () => any }
  parent: ComponentInstance | null
  vnode: any
  ctx: Record<string, any>
  proxy: any
  isMounted: boolean
  isUnmounted: boolean
  subTree: any
  hooks: { type: ComponentLifecycle; fn: Function }[]
  // 状态机标志位
  flags: {
    isInBeforeCreate: boolean
    isInSetup: boolean
    isInCreated: boolean
    isInMount: boolean
  }
}

let __uid = 0
let __currentInstance: ComponentInstance | null = null
const trace = ref<string[]>([])

function push(s: string) { trace.value.unshift(`[${trace.value.length}] ${s}`) }

function createComponentInstance(vnode: any, parent: ComponentInstance | null): ComponentInstance {
  const instance: ComponentInstance = {
    uid: ++__uid,
    type: vnode.type,
    parent,
    vnode,
    ctx: { _: instance } as any,
    proxy: null as any,
    isMounted: false,
    isUnmounted: false,
    subTree: null,
    hooks: [],
    flags: {
      isInBeforeCreate: false,
      isInSetup: false,
      isInCreated: false,
      isInMount: false
    }
  }
  ;(instance.ctx as any)._ = instance
  push(`createComponentInstance uid=${instance.uid} (${instance.type.name})`)
  return instance
}

function callHook(instance: ComponentInstance, type: ComponentLifecycle) {
  push(`触发钩子 ${type}（uid=${instance.uid}）`)
  const hooks = instance.hooks.filter(h => h.type === type)
  for (const h of hooks) h.fn()
}

// 简化版 onXxx：在 setup 内通过 currentInstance 找到当前实例
function onMounted(fn: Function) {
  if (!__currentInstance) { console.warn('onMounted 必须在 setup 内调用'); return }
  __currentInstance.hooks.push({ type: ComponentLifecycle.MOUNTED, fn })
  push(`onMounted 注册（uid=${__currentInstance.uid}）`)
}

function setupComponent(instance: ComponentInstance) {
  instance.flags.isInBeforeCreate = true
  callHook(instance, ComponentLifecycle.BEFORE_CREATE)
  instance.flags.isInBeforeCreate = false

  instance.flags.isInSetup = true
  push(`setupComponent: 进入 setup (uid=${instance.uid})`)
  const setup = instance.type.setup
  let setupResult: any = null
  if (setup) {
    const prev = __currentInstance
    __currentInstance = instance
    setupResult = setup()
    __currentInstance = prev
  }
  // 把 setup 返回的对象绑到 ctx 上（简化）
  if (setupResult) Object.assign(instance.ctx, setupResult)
  instance.flags.isInSetup = false

  instance.flags.isInCreated = true
  callHook(instance, ComponentLifecycle.CREATED)
  instance.flags.isInCreated = false
}

function render(instance: ComponentInstance) {
  push(`render: 调用 render() 生成 subTree（uid=${instance.uid}）`)
  instance.subTree = instance.type.render?.() ?? { type: 'div', children: [] }
}

function mountComponent(vnode: any, container: any, parentInstance: ComponentInstance | null) {
  const instance = createComponentInstance(vnode, parentInstance)
  setupComponent(instance)
  // 渲染 effect（首次同步执行）
  instance.flags.isInMount = true
  render(instance)
  callHook(instance, ComponentLifecycle.BEFORE_MOUNT)
  // 简化：直接 patch subTree 到 container
  ;(container as any).__subTree = instance.subTree
  instance.isMounted = true
  instance.flags.isInMount = false
  callHook(instance, ComponentLifecycle.MOUNTED)
  return instance
}

function patch(prev: any, next: any, container: any, parentInstance: ComponentInstance | null) {
  if (!prev) mountComponent(next, container, parentInstance)
  else updateComponent(prev, next)
}

function updateComponent(prev: ComponentInstance, nextVNode: any) {
  push(`updateComponent: uid=${prev.uid}`)
  callHook(prev, ComponentLifecycle.BEFORE_UPDATE)
  prev.type = nextVNode.type
  render(prev)
  callHook(prev, ComponentLifecycle.UPDATED)
}

/* ============================================================
 * 演示：构造两个组件挂载并显示 trace
 * ============================================================ */

const Child = {
  name: 'Child',
  setup() {
    onMounted(() => push('>> Child: 自己的 mounted 回调'))
    return { who: 'I am Child' }
  },
  render() { return { type: 'span', children: [this.ctx.who] } }
}

const Parent = {
  name: 'Parent',
  setup() {
    onMounted(() => push('>> Parent: 自己的 mounted 回调'))
    return {}
  },
  render() {
    return {
      type: 'div',
      children: [
        { type: Child }
      ]
    }
  }
}

const container = { __subTree: null as any }
mountComponent({ type: Parent }, container, null)

const tree = computed(() => JSON.stringify(container.__subTree, null, 2))
</script>

<template>
  <div class="mount-demo">
    <h3>06 · 组件挂载全流程</h3>
    <p>currentInstance 流程：setup 内通过全局变量绑定当前实例，onXxx 才能注册到正确组件。</p>

    <div class="grid">
      <section>
        <h4>当前 subTree（简化）</h4>
        <pre>{{ tree }}</pre>
      </section>
      <section>
        <h4>trace 日志</h4>
        <ul class="log">
          <li v-for="(t, i) in trace.slice(0, 30)" :key="i">{{ t }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.mount-demo { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
section { background: #fafafa; padding: .75rem; border-radius: 6px; min-height: 280px; }
section h4 { margin: 0 0 .5rem; font-size: .9rem; }
pre { font-size: .75rem; white-space: pre-wrap; word-break: break-all; background: #fff; padding: .5rem; border: 1px solid #ddd; border-radius: 4px; }
.log { max-height: 280px; overflow: auto; font-size: .78rem; padding-left: 1rem; }
</style>
