<template>
  <section class="r14">
    <h2>ref 自动解包与转换工具</h2>

    <!-- ① 模板内自动解包 -->
    <div class="card">
      <h3>① 模板内自动解包（无需 .value）</h3>
      <p>{{ count }} (从 count 读取，无 .value)</p>
      <button @click="count.value++">count.value++</button>
    </div>

    <!-- ② reactive 内的 ref 自动解包 -->
    <div class="card">
      <h3>② reactive 对象属性中的 ref 自动解包</h3>
      <p>state.r 直接显示 {{ state.r }}（不是 ref 对象）</p>
      <p>对象形式：{{ JSON.stringify(state) }}</p>
      <button @click="state.r.value++">通过 state.r.value++</button>
    </div>

    <!-- ③ isRef / unref / toRef / toRefs -->
    <div class="card">
      <h3>③ 转换工具对照</h3>
      <ul>
        <li>isRef(count): {{ String(isRef(count)) }}</li>
        <li>unref(count): {{ unref(count) }}</li>
        <li>toRef(state, 'r').value: {{ rRef.value }}</li>
        <li>解构后是否仍是 ref: r = {{ String(isRef(rFromToRefs)) }}</li>
      </ul>
      <p>解构后的 r: {{ rFromToRefs }} (模板里仍自动解包)</p>
    </div>

    <!-- ④ customRef 异步防抖 -->
    <div class="card">
      <h3>④ customRef 异步防抖 ref</h3>
      <input v-model="debounced" placeholder="快速键入观察防抖" />
      <p>同步值：{{ rawInput }}</p>
      <p>防抖值（300ms 后才更新）：{{ debouncedLog }}</p>
    </div>

    <!-- ⑤ triggerRef -->
    <div class="card">
      <h3>⑤ triggerRef 强制触发</h3>
      <p>count: {{ manualRef.value }} render: {{ manualRender }}</p>
      <button @click="mutateRefSilently">静默修改 + triggerRef</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, isRef, unref, toRef, toRefs, customRef, triggerRef, watch } from 'vue'

/* === ① 模板自动解包 === */
const count = ref(0)

/* === ② reactive 内的 ref === */
const state = reactive({ r: ref(10) })

/* === ③ 转换工具 === */
const rRef = toRef(state, 'r')
const { r: rFromToRefs } = toRefs(state)

/* === ④ customRef 异步防抖 === */
const rawInput = ref('')
function useDebouncedRef<T>(initial: T, delay = 300) {
  let value = initial
  let timer: ReturnType<typeof setTimeout> | null = null
  return customRef<T>((track, trigger) => ({
    get() {
      track()                // 必须调用：收集依赖
      return value
    },
    set(newValue: T) {
      rawInput.value = String(newValue)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        value = newValue
        trigger()            // 必须调用：通知更新
      }, delay)
    }
  }))
}
const debounced = useDebouncedRef<string>('', 300)
const debouncedLog = ref('')
watch(debounced, v => { debouncedLog.value = v })

/* === ⑤ triggerRef === */
const manualRef = ref(0)
const manualRender = ref(0)
watch(manualRef, () => { manualRender.value++ })
function mutateRefSilently() {
  // 直接替换 ref.value 已经是触发更新，这里演示使用 shallowRef + triggerRef
  manualRef.value++ // 普通 ref 直接改即可
  triggerRef(manualRef)
}
</script>

<style scoped>
.r14 { font-family: system-ui; padding: 1rem; }
.r14 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r14 input { padding: 4px; }
.r14 button { margin-right: 0.4rem; }
.r14 ul { margin: 0; padding-left: 1.2rem; }
</style>
