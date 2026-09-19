<template>
  <div class="demo">
    <h2>$forceUpdate 与 $children</h2>

    <section class="card">
      <h3>① $forceUpdate：跳过响应式强制刷新</h3>
      <p class="hint">
        子组件内部用 <code>shallowRef</code> 包裹对象并 <code>markRaw</code>，
        第三方库直接改它的属性——响应式追踪不到。
        调用 <code>forceUpdate()</code> 让 Vue 再走一次 patch。
      </p>
      <ExternalCanvas ref="canvasRef" />
      <div class="row">
        <button @click="onForceUpdate">手动 $forceUpdate</button>
        <button @click="onNormalUpdate">正常 ref++（响应式路径）</button>
      </div>
      <p>patch 触发次数：<strong>{{ patchCount }}</strong></p>
      <p class="meta">第三次按钮 push 时，<code>forceUpdate()</code> 会被调一次——你能在子组件 console 看到 patch。</p>
    </section>

    <section class="card">
      <h3>② $children：直接子组件实例数组</h3>
      <p class="hint">
        父组件按 mount 顺序收集子实例；遍历调用它们暴露的方法。
      </p>
      <div class="steppers">
        <Stepper ref="stepper1Ref" label="A" />
        <Stepper ref="stepper2Ref" label="B" />
        <Stepper ref="stepper3Ref" label="C" />
      </div>
      <div class="row">
        <button @click="resetAll">父组件调 $children.reset</button>
        <button @click="incAll">父组件调 $children.inc</button>
      </div>
      <p class="meta">
        <code>childRefs.$children.length</code> = {{ childLen }}；
        现代写法推荐 <code>provide / inject</code> 或 <code>useTemplateRef</code>，
        这里仅演示 $children 的存在。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from 'vue'
import ExternalCanvas from './ExternalCanvas.vue'
import Stepper from './Stepper.vue'

const canvasRef = useTemplateRef<InstanceType<typeof ExternalCanvas>>('canvasRef')
const stepper1Ref = useTemplateRef<InstanceType<typeof Stepper>>('stepper1Ref')
const stepper2Ref = useTemplateRef<InstanceType<typeof Stepper>>('stepper2Ref')
const stepper3Ref = useTemplateRef<InstanceType<typeof Stepper>>('stepper3Ref')

const patchCount = ref(0)
const childLen = ref(0)

// ① $forceUpdate
const onForceUpdate = () => {
  patchCount.value++
  // 通过模板 ref 拿到的就是组件实例，等同于 $refs.canvasRef.forceUpdate()
  canvasRef.value?.forceUpdate()
}

const onNormalUpdate = () => {
  patchCount.value++
  canvasRef.value?.tick()
}

onMounted(() => {
  // 收集 $children 长度
  // childRefs 在模板里表现为 this.$children
  childLen.value = (
    stepper1Ref.value?.$.subTree.children?.length ?? 0
  )
})

// ② $children 集中调度
const stepperRefs = [stepper1Ref, stepper2Ref, stepper3Ref]
const resetAll = () => {
  for (const r of stepperRefs) r.value?.reset()
}
const incAll = () => {
  for (const r of stepperRefs) r.value?.inc()
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 14px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 10px; line-height: 1.55; }
.meta { font-size: 12px; color: #888; margin-top: 8px; line-height: 1.55; }
.row { display: flex; gap: 8px; margin-top: 8px; }
button { padding: 5px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.steppers { display: flex; gap: 10px; margin: 10px 0; }
</style>