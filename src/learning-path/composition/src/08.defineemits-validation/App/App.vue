<template>
  <div class="demo">
    <h2>defineEmits 校验</h2>

    <section class="card">
      <h3>1. 强类型 emit + 参数推断</h3>
      <Counter @change="onChange" />
      <p class="hint">声明了 <code>change: (v: number) =&gt; void</code>，事件名/参数都受校验</p>
    </section>

    <section class="card">
      <h3>2. 多个 payload 类型 (union)</h3>
      <SearchBox @submit="onSubmit" />
      <p class="hint">payload 可以是字符串或对象</p>
    </section>

    <section class="card">
      <h3>3. 触发未声明事件 (会触发 console.warn)</h3>
      <GhostEmitter ref="ghostRef" />
      <button @click="triggerUnknown">触发 ghost 事件</button>
      <p class="hint">事件未在 emit 声明中，dev 模式将打印 [Vue warn]</p>
    </section>

    <section class="card">
      <h3>4. v-model 双向绑定 (update:modelValue)</h3>
      <input v-model="text" placeholder="编辑我" />
      <p>父组件 value: <strong>{{ text }}</strong></p>
      <p class="hint">v-model 自动展开为 modelValue + @update:modelValue</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Counter from './Counter.vue'
import SearchBox from './SearchBox.vue'
import GhostEmitter from './GhostEmitter.vue'

const onChange = (n: number) => {
  console.log('[parent] received change:', n)
}

const onSubmit = (payload: string | { q: string }) => {
  console.log('[parent] submit payload:', payload)
}

const ghostRef = ref<InstanceType<typeof GhostEmitter> | null>(null)
const triggerUnknown = () => {
  // 通过 ref 调用子组件的 emit
  ;(ghostRef.value as unknown as { emit: (e: string) => void } | null)?.emit?.('ghost-event')
}

const text = ref('hello')
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; margin-right: 8px; }
button { padding: 5px 10px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
