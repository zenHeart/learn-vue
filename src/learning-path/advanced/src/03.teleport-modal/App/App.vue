<template>
  <div>
    <h2>模态框传送示例</h2>
    <button @click="showModal = true">打开模态框</button>
    <teleport to="body">
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h3>模态框标题</h3>
          <p>这是模态框的内容。</p>
          <button @click="showModal = false">关闭</button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const showModal = ref(false)
    return { showModal }
  }
}
</script>

<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>