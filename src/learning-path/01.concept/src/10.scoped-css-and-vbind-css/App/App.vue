<template>
  <div class="demo">
    <h3>scoped CSS 与 v-bind() in CSS</h3>

    <section class="card">
      <h4>① scoped CSS：data-v 注入</h4>
      <p class="hint">子组件根元素继承 <code>data-v</code>，其余不继承；可通过 :deep() 穿透。</p>
      <p class="scoped-demo">scoped 样式只命中我</p>
      <Child />
    </section>

    <section class="card">
      <h4>② v-bind() in CSS：响应式驱动</h4>
      <p class="hint">改 <code>color</code> / <code>size</code> 即时同步到 CSS 变量。</p>
      <div class="theme-demo">主题色与字号随输入变化</div>
      <label>
        color：
        <input v-model="color" type="color" />
      </label>
      <label>
        size：
        <input v-model.number="size" type="range" min="12" max="28" />
      </label>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'

const color = ref('#6366f1')
const size = ref(16)
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h4 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 8px; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: 12px; }

.scoped-demo {
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 4px;
}

/* ② v-bind() in CSS */
.theme-demo {
  padding: 14px;
  margin: 8px 0 12px;
  border-radius: 6px;
  background: #f1f5f9;
  color: v-bind(color);
  font-size: v-bind(size + 'px');
  transition: color 0.2s, font-size 0.2s;
}

label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 12px;
  font-size: 13px;
}
</style>