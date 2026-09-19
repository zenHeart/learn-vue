<template>
  <div class="demo">
    <h2>GlobalComponents · 组件库类型增强</h2>
    <p class="hint">
      演示如何通过 <code>declare module 'vue'</code> 扩展 <code>GlobalComponents</code> 接口，
      让模板里无需 import 即可使用 <code>&lt;AppButton /&gt;</code> 等组件，并获得完整类型提示。
    </p>

    <!-- ① 直接使用未 import 的组件 -->
    <section class="card">
      <h3>① 模板里直接使用全局组件</h3>
      <AppCard title="用户信息">
        <AppBadge tone="success">活跃</AppBadge>
        <AppBadge tone="warn">试用</AppBadge>
        <AppBadge tone="error">禁用</AppBadge>
        <AppBadge>默认</AppBadge>
        <p class="hint">所有标签都没在 setup 里 import；类型提示来自 global-components.d.ts</p>
      </AppCard>
    </section>

    <!-- ② props 类型校验 -->
    <section class="card">
      <h3>② props 自动推导</h3>
      <AppButton variant="primary" size="md" @click="onClick">Primary</AppButton>
      <AppButton variant="secondary" size="sm">Secondary</AppButton>
      <AppButton variant="ghost" size="lg" :disabled="true">Disabled</AppButton>
      <p class="hint">
        variant: primary / secondary / ghost；size: sm / md / lg；disabled: boolean
        —— 全是 IDE 推断，无需手写
      </p>
    </section>

    <!-- ③ 错误示范（注释提示） -->
    <section class="card warn">
      <h3>③ 错误示范（注释里展示）</h3>
      <pre class="code"><code>&lt;!-- 这行写错会立即红线提示 --&gt;
&lt;AppButton variant="invalid" /&gt;  ❌ Type '"invalid"' is not assignable to type 'Variant'
&lt;AppBadge tone="unknown" /&gt;       ❌ Type '"unknown"' is not assignable to type 'Tone'</code></pre>
    </section>

    <!-- ④ 完整的 declare module 内容 -->
    <section class="card">
      <h3>④ global-components.d.ts 模板</h3>
      <pre class="code"><code>import type { GlobalComponents } from 'vue'
import AppButton from './AppButton.vue'
import AppCard from './AppCard.vue'
import AppBadge from './AppBadge.vue'

declare module 'vue' {
  interface GlobalComponents {
    AppButton: typeof AppButton
    AppCard: typeof AppCard
    AppBadge: typeof AppBadge
  }
}

export {}</code></pre>
    </section>
  </div>
</template>

<script setup lang="ts">
// 注意：这里没有 import 任何组件，但模板能直接用 AppButton 等
// 类型由 .d.ts 提供

function onClick(e: MouseEvent) {
  // emit 推断：payload 是 MouseEvent
  console.log('clicked', e.clientX, e.clientY)
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card.warn { background: #fef2f2; border-color: #fecaca; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0; font-size: 12px; color: #666; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.code { background: #1e1e1e; color: #d4d4d4; padding: 8px; border-radius: 4px; font-size: 11px; overflow-x: auto; white-space: pre; }
</style>