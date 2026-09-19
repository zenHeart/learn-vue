<template>
  <div class="demo">
    <h2>Teleport 多目标 + disabled</h2>

    <section class="card">
      <h3>1. 默认渲染到 body</h3>
      <button @click="modal1 = true">打开 Modal</button>
      <Teleport to="body">
        <div class="modal-mask" v-if="modal1" @click.self="modal1 = false">
          <div class="modal-body">
            <h4>Modal 1 (渲染到 body)</h4>
            <p>此处 DOM 实际在 &lt;body&gt; 下，但响应式状态仍在父组件</p>
            <button @click="modal1 = false">关闭</button>
          </div>
        </div>
      </Teleport>
    </section>

    <section class="card">
      <h3>2. 多个 Teleport 渲染到同一目标</h2>
      <button @click="notice = !notice">切换通知</button>
      <Teleport to="#teleport-target">
        <div class="notice" v-if="notice">通知 1</div>
      </Teleport>
      <Teleport to="#teleport-target">
        <div class="notice secondary">通知 2</div>
      </Teleport>
      <div id="teleport-target" class="target">目标容器</div>
    </section>

    <section class="card">
      <h3>3. disabled 切换</h3>
      <button @click="disabled = !disabled">disabled = {{ disabled }}</button>
      <Teleport to="body" :disabled="disabled">
        <div class="inner-box">
          {{ disabled ? '在原父组件中' : '已移动到 body 末尾' }}
        </div>
      </Teleport>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const modal1 = ref(false)
const notice = ref(true)
const disabled = ref(true)
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; margin-right: 6px; }
.target { margin-top: 8px; padding: 8px; background: #f0f5ff; border-radius: 4px; min-height: 30px; }
.inner-box { padding: 8px; background: #fffbe6; border: 1px dashed #f5b400; border-radius: 4px; display: inline-block; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-body { background: #fff; padding: 20px; border-radius: 6px; min-width: 320px; }
.notice { padding: 4px 10px; margin: 2px 0; background: #e6f4ff; border-radius: 4px; }
.notice.secondary { background: #f6ffed; }
</style>
