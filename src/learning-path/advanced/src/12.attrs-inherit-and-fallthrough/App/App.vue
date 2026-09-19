<template>
  <div class="demo">
    <h2>attrs 透传与 inheritAttrs</h2>

    <section class="card">
      <h3>1. 默认 fallthrough (单根)</h3>
      <SimpleBox class="custom-class" data-id="100" @custom-event="onEvent" />
      <p class="hint">class 自动加到根 div；data-id 也是</p>
    </section>

    <section class="card">
      <h3>2. inheritAttrs: false + useAttrs()</h2>
      <MultiBox class="from-parent" data-info="hello" />
    </section>

    <section class="card">
      <h3>3. 多根 + 显式分发</h3>
      <Wrapper class="wrap-cls" data-info="wrapper" />
    </section>
  </div>
</template>

<script setup lang="ts">
import SimpleBox from './SimpleBox.vue'
import MultiBox from './MultiBox.vue'
import Wrapper from './Wrapper.vue'

const onEvent = (e: CustomEvent) => {
  console.log('[parent] received custom-event:', e)
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
</style>
