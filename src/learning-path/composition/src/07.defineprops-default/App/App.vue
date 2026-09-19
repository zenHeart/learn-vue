<template>
  <div class="demo">
    <h2>defineProps 默认值 / 类型推断</h2>

    <section class="card">
      <h3>1. 必填 + 可选 + 默认值</h3>
      <Child
        :msg="parentMsg"
        :count="3"
        :tags="['urgent', 'frontend']"
      />
      <p class="hint">count 不传时使用默认值 0；tags 是带类型的数组</p>
    </section>

    <section class="card">
      <h3>2. 运行时声明 vs 类型声明</h3>
      <RuntimeProps :title="'运行时声明'" :score="98" />
      <p class="hint">运行时声明可直接写 default: () =&gt; []，类型由 type 推导</p>
    </section>

    <section class="card">
      <h3>3. 触发 required 校验</h3>
      <RequiredProps msg="显式传值" />
      <p class="hint">开发模式下不传 msg 会触发 console.warn</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'
import RuntimeProps from './RuntimeProps.vue'
import RequiredProps from './RequiredProps.vue'

const parentMsg = ref('来自父组件的问候')
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
</style>
