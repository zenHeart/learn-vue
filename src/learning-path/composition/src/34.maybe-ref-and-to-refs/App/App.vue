<template>
  <div class="demo">
    <h2>MaybeRef + toRefs · 通用 composable 签名</h2>
    <p class="hint">
      演示 composable 如何用 <code>MaybeRefOrGetter</code> 同时接受静态值、
      ref、getter 三种 source；以及 <code>toRefs</code> 如何保留响应式地解构。
    </p>

    <section class="card">
      <h3>① 同一个 useTitle 支持三种 source</h3>
      <label>
        <input v-model="staticTitle" placeholder="输入" />
        <code>ref({{ '{' }} ... {{ '}' }})</code>
      </label>
      <p class="hint">document.title 已绑定 → 切回页面看标题栏变化</p>
    </section>

    <section class="card">
      <h3>② useGreeting 三种调用方式</h3>
      <ul>
        <li>静态值: {{ greetingFromStatic }}</li>
        <li>ref: {{ greetingFromRef }}</li>
        <li>getter: {{ greetingFromGetter }}</li>
      </ul>
      <p class="hint">三种 source 在 useGreeting 内部统一被 <code>toValue</code> 解包</p>
    </section>

    <section class="card">
      <h3>③ toRefs 解构保留响应式</h3>
      <p>count = {{ count }}, double = {{ double }}, label = {{ label }}</p>
      <button @click="inc">count++</button>
      <p class="hint">useCounter 内部用 reactive，return toRefs(state) — 解构出的 count 仍是 ref</p>
    </section>

    <section class="card">
      <h3>④ 类型签名打印</h3>
      <pre class="code"><code>// 类型定义（鼠标悬停查看）
// type MaybeRef&lt;T&gt; = T | Ref&lt;T&gt;
// type MaybeRefOrGetter&lt;T&gt; = T | Ref&lt;T&gt; | (() =&gt; T)
//
// function useTitle(source: MaybeRefOrGetter&lt;string&gt;): void
// function useGreeting(source: MaybeRefOrGetter&lt;string&gt;): string
// function useCounter(): { count: Ref&lt;number&gt;, double: ComputedRef&lt;number&gt;, label: Ref&lt;string&gt; }</code></pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, toValue, toRefs, watchEffect, type MaybeRefOrGetter, type Ref, type ComputedRef } from 'vue'

const staticTitle = ref('Hello Vue')

/* === ① useTitle === */
function useTitle(source: MaybeRefOrGetter<string>) {
  watchEffect(() => {
    document.title = toValue(source)
  })
}
useTitle(staticTitle)

/* === ② useGreeting === */
function useGreeting(source: MaybeRefOrGetter<string>): string {
  return toValue(source)
}

const greetingFromStatic = useGreeting('静态问候')
const refName = ref('响应式问候')
const greetingFromRef = useGreeting(refName)
const greetingFromGetter = useGreeting(() => 'getter 问候')

/* === ③ useCounter with toRefs === */
function useCounter() {
  const state = reactive({
    count: 0,
    label: 'clicks',
  })
  const double = computed(() => state.count * 2)
  return { ...toRefs(state), double }
}

const { count, double, label } = useCounter()
// 鼠标悬停查看：count 是 Ref&lt;number&gt;, double 是 ComputedRef&lt;number&gt;, label 是 Ref&lt;string&gt;
function inc() {
  count.value++
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0; font-size: 12px; color: #666; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.code { background: #1e1e1e; color: #d4d4d4; padding: 8px; border-radius: 4px; font-size: 11px; overflow-x: auto; }
ul { padding-left: 20px; font-size: 13px; }
label { display: flex; gap: 6px; align-items: center; font-size: 13px; }
input { padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; flex: 1; }
button { padding: 6px 14px; background: #42b883; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
</style>