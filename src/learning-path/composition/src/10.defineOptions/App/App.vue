<template>
  <div class="demo">
    <h2>defineOptions 宏</h2>

    <section class="card">
      <h3>1. name 字段 (供 devtools 与组件递归)</h3>
      <NamedCard title="递归渲染自身" />
      <p class="hint">组件内部通过 name: 'NamedCard' 递归调用自身</p>
    </section>

    <section class="card">
      <h3>2. inheritAttrs: false + 多根节点</h3>
      <MultiRootBox data-info="来自父组件" class="extra" />
      <p class="hint">class / style 自动 fallthrough；data-info 不会显示在根上</p>
    </section>

    <section class="card">
      <h3>3. 任意 customOptions</h3>
      <CustomBox />
      <p class="hint">customOptions 通过 <code>this.$options.customOptions</code> 暴露给运行时</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import NamedCard from './NamedCard.vue'
import MultiRootBox from './MultiRootBox.vue'
import CustomBox from './CustomBox.vue'
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
</style>
