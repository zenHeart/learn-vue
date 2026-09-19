<template>
  <div class="demo">
    <h3>Teleport 嵌套 + Suspense 错误边界 + Transition</h3>
    <p class="hint">
      三个内置组件的边界场景：Teleport 的嵌套解析、Suspense 异步 setup 抛错、
      Transition + Teleport 的淡入淡出协作。
    </p>

    <section class="card">
      <h4>① Teleport 嵌套：内层 to 优先生效</h4>
      <p>外层 Teleport 到 <code>#outer</code>，内层 Teleport 到 <code>#inner</code>：</p>
      <Teleport to="#outer">
        <div class="layer outer">
          <strong>外层 Teleport → #outer</strong>
          <Teleport to="#inner">
            <div class="layer inner">内层 Teleport → #inner</div>
          </Teleport>
        </div>
      </Teleport>
      <p class="hint">最终结构：内层 div 落到 #inner 容器，外层 div 落到 #outer 容器</p>
    </section>

    <section class="card">
      <h4>② Teleport + Transition 弹窗</h4>
      <button @click="open = !open">{{ open ? '关闭' : '打开' }} 弹窗</button>
      <Teleport to="#modal-root">
        <Transition name="modal">
          <div v-if="open" class="modal" @click="open = false">
            <div class="modal-body" @click.stop>
              <p>Teleport + Transition 协作</p>
              <button @click="open = false">关闭</button>
            </div>
          </div>
        </Transition>
      </Teleport>
    </section>

    <section class="card">
      <h4>③ Suspense 错误边界：异步 setup 抛错</h4>
      <div class="row">
        <button @click="reset">重新触发</button>
      </div>
      <Suspense>
        <template #default>
          <AsyncChild :key="nonce" />
        </template>
        <template #fallback>
          <p class="fallback">加载中（Suspense fallback）...</p>
        </template>
        <template #error="{ error }">
          <p class="err-boundary">Suspense 错误边界捕获: <code>{{ error.message }}</code></p>
        </template>
      </Suspense>
      <p class="hint">异步 setup 中 <code>throw new Error()</code> 会被 Suspense 捕获并展示 #error</p>
    </section>

    <section class="card">
      <h4>④ 三组合：Suspense → Teleport → Transition</h4>
      <p>异步组件加载期间显示 loading（也用 Teleport 传送到固定位置），加载完成后 Modal 用 Transition 淡入。</p>
      <button @click="comboKey++">重新加载（看 fallback）</button>
      <button @click="comboModal = !comboModal">{{ comboModal ? '隐藏' : '显示' }} 三组合弹窗</button>
      <Suspense>
        <template #default>
          <AsyncLayout :key="comboKey">
            <Teleport to="#modal-root">
              <Transition name="combo">
                <div v-if="comboModal" class="combo-modal">
                  <p>Suspense + Teleport + Transition</p>
                </div>
              </Transition>
            </Teleport>
          </AsyncLayout>
        </template>
        <template #fallback>
          <Teleport to="#modal-root">
            <div class="combo-loading">combo loading...</div>
          </Teleport>
        </template>
      </Suspense>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AsyncChild from './AsyncChild.vue'
import AsyncLayout from './AsyncLayout.vue'

const open = ref(false)
const nonce = ref(0)
const reset = () => nonce.value++
const comboKey = ref(0)
const comboModal = ref(false)
</script>

<style scoped>
.demo {
  max-width: 820px;
  margin: 16px auto;
  padding: 16px;
  color: #213547;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.card {
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e293b;
}
.hint {
  font-size: 12px;
  color: #64748b;
  margin: 6px 0;
}
code {
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.82rem;
}
.row { display: flex; gap: 6px; margin-bottom: 8px; }
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 6px;
}
.layer { padding: 8px; border-radius: 4px; font-size: 13px; }
.layer.outer { background: #fef3c7; border: 1px solid #fcd34d; }
.layer.inner { background: #dbeafe; border: 1px solid #93c5fd; margin-top: 6px; }
.modal {
  position: fixed; inset: 0; background: rgba(0,0,0,.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-body {
  background: #fff; padding: 24px; border-radius: 8px; min-width: 240px;
}
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: opacity .25s; }
.combo-modal {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: #fff; padding: 16px 24px; border-radius: 6px; z-index: 1001;
}
.combo-enter-from, .combo-leave-to { opacity: 0; transform: translate(-50%, -50%) scale(.8); }
.combo-enter-active, .combo-leave-active { transition: all .25s; }
.combo-loading {
  position: fixed; top: 16px; right: 16px;
  background: #fef3c7; padding: 8px 12px; border-radius: 6px; font-size: 12px;
}
.fallback { color: #64748b; font-size: 13px; margin: 4px 0; }
.err-boundary {
  background: #fee2e2; border: 1px solid #fca5a5; padding: 8px 10px;
  border-radius: 4px; color: #991b1b; font-size: 13px; margin: 4px 0;
}
</style>