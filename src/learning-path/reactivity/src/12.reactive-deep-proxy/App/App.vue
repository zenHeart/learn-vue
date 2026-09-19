<template>
  <section class="r12">
    <h2>reactive 深度代理与 Proxy 拦截</h2>

    <!-- Part 1: 原始值无响应 -->
    <div class="card">
      <h3>① 原始值不会变成响应式</h3>
      <p>尝试修改 <code>num</code>：{{ numLabel }}</p>
      <button @click="mutateNum">mutate num</button>
    </div>

    <!-- Part 2: 嵌套对象按需代理 -->
    <div class="card">
      <h3>② 嵌套对象按需代理</h3>
      <pre>{{ JSON.stringify(state, null, 2) }}</pre>
      <button @click="state.user.profile.age++">user.profile.age++</button>
      <button @click="addSkill">push skill</button>
    </div>

    <!-- Part 3: 13 个 Proxy trap 触发计数 -->
    <div class="card">
      <h3>③ 13 个 trap 触发统计</h3>
      <button @click="runTrapTest">运行 trap 测试</button>
      <table>
        <thead>
          <tr><th>trap</th><th>触发次数</th></tr>
        </thead>
        <tbody>
          <tr v-for="(count, name) in trapLog" :key="name">
            <td>{{ name }}</td>
            <td>{{ count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

/**
 * Part 1: 原始值不会变成响应式。
 * reactive(0) 直接返回 0，因此模板里 numLabel 不会更新。
 */
const num = reactive(0)
let numLastSeen = 0
const numLabel = ref(0) // 用 ref 作为可视化输出
function mutateNum() {
  numLastSeen++
  // @ts-ignore 试图给原始值赋值不会有响应式效果
  num = numLastSeen
  numLabel.value = numLastSeen
}
import { ref } from 'vue'

/**
 * Part 2: 嵌套对象按需代理。
 * - state.user 是 reactive
 * - 读取 state.user.profile 第一次时，Proxy.get 拦截中递归创建 reactive 代理
 * - 新 push 的 skill 数组也会被自动代理
 */
interface State {
  user: { profile: { name: string; age: number }; tags: string[] }
  count: number
}
const state = reactive<State>({
  user: {
    profile: { name: 'Alice', age: 18 },
    tags: ['frontend', 'vue']
  },
  count: 0
})
function addSkill() {
  state.user.tags.push(`skill-${state.count}`)
  state.count++
}

/**
 * Part 3: 演示 13 个常用 trap 的实际触发。
 * 我们手动 new Proxy 包装 reactive 后的对象，统计每个 trap 的调用次数。
 */
const trapLog = reactive<Record<string, number>>({
  get: 0,
  set: 0,
  has: 0,
  deleteProperty: 0,
  ownKeys: 0,
  defineProperty: 0,
  getOwnPropertyDescriptor: 0,
  getPrototypeOf: 0,
  setPrototypeOf: 0,
  apply: 0,
  construct: 0,
  preventExtensions: 0,
  isExtensible: 0
})

function runTrapTest() {
  // 每次测试重置计数
  for (const k in trapLog) trapLog[k] = 0

  const target: any = { a: 1, b: { c: 2 } }
  const proxy = new Proxy(target, {
    get(t, k) { trapLog.get++; return Reflect.get(t, k) },
    set(t, k, v) { trapLog.set++; return Reflect.set(t, k, v) },
    has(t, k) { trapLog.has++; return Reflect.has(t, k) },
    deleteProperty(t, k) { trapLog.deleteProperty++; return Reflect.deleteProperty(t, k) },
    ownKeys(t) { trapLog.ownKeys++; return Reflect.ownKeys(t) },
    defineProperty(t, k, d) { trapLog.defineProperty++; return Reflect.defineProperty(t, k, d) },
    getOwnPropertyDescriptor(t, k) { trapLog.getOwnPropertyDescriptor++; return Reflect.getOwnPropertyDescriptor(t, k) },
    getPrototypeOf(t) { trapLog.getPrototypeOf++; return Reflect.getPrototypeOf(t) },
    setPrototypeOf(t, p) { trapLog.setPrototypeOf++; return Reflect.setPrototypeOf(t, p) },
    apply(t, _this, args) { trapLog.apply++; return Reflect.apply(t as any, _this, args) },
    construct(t, args) { trapLog.construct++; return Reflect.construct(t as any, args) },
    preventExtensions(t) { trapLog.preventExtensions++; return Reflect.preventExtensions(t) },
    isExtensible(t) { trapLog.isExtensible++; return Reflect.isExtensible(t) }
  })

  // 触发各种 trap
  proxy.a            // get
  proxy.b.c          // get (递归)
  proxy['a'] = 2     // set
  'a' in proxy       // has
  delete proxy.a     // deleteProperty
  Object.keys(proxy) // ownKeys
  Object.defineProperty(proxy, 'x', { value: 1 }) // defineProperty
  Object.getOwnPropertyDescriptor(proxy, 'x')     // getOwnPropertyDescriptor
  Object.getPrototypeOf(proxy)                    // getPrototypeOf
  Object.setPrototypeOf(proxy, null)              // setPrototypeOf
  Object.isExtensible(proxy)                      // isExtensible
}
</script>

<style scoped>
.r12 { font-family: system-ui; padding: 1rem; }
.r12 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r12 pre { background: #f6f8fa; padding: 0.5rem; font-size: 12px; }
.r12 button { margin-right: 0.4rem; }
.r12 table { border-collapse: collapse; margin-top: 0.5rem; }
.r12 th, .r12 td { border: 1px solid #ddd; padding: 4px 12px; text-align: left; }
</style>
