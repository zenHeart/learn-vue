<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① v-pre：跳过编译，原样输出</h4>
      <div v-pre>{{ msg }} 不会被编译</div>
      <p class="hint">打开 DevTools 看：节点文本是 "{{ msg }} 不会被编译" 而不是具体值</p>
    </section>

    <section class="card">
      <h4>② v-pre 内部指令失效</h4>
      <div v-pre>
        <span>{{ text }}</span>
        <button @click="text = 'changed'">点击（不生效）</button>
      </div>
      <p class="hint">v-pre 节点和子节点跳过编译，{{ text }} 仍是字符串，button 绑定也无效</p>
    </section>

    <section class="card">
      <h4>③ v-pre 节点外层正常编译</h4>
      <p>外层正常：{{ msg }}</p>
      <div v-pre>内层 v-pre：{{ msg }}</div>
      <p class="hint">v-pre 仅作用于该节点，子节点外的兄弟节点照常编译</p>
    </section>

    <section class="card">
      <h4>④ v-pre 与动态参数语法</h4>
      <div v-pre>
        演示动态参数: :[dynamicArg]="value"
      </div>
      <p class="hint">即使包含 Vue 模板语法也照原样输出</p>
    </section>

    <section class="card">
      <h4>⑤ v-cloak：首屏防闪烁</h4>
      <p class="hint">缓慢显示：组件挂载后 v-cloak 被卸载 —— 验证防闪烁</p>
      <div class="cloak-target" v-cloak>动态内容: {{ msg }}</div>
      <button @click="msg += '!'">msg++</button>
      <p class="hint">v-cloak 在挂载完成前由 CSS 隐藏；完成后由 patch 卸载</p>
    </section>

    <section class="card">
      <h4>⑥ v-cloak + 自定义 CSS 控制</h4>
      <div class="cloak-target cloak-blue" v-cloak>蓝色 cloaked</div>
      <p class="hint">scoped 样式用 :deep 选择器才能作用到未挂载节点</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('v-pre 跳过编译 + v-cloak 首屏防闪烁')

const msg = ref('init')
const text = ref('initText')
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
  margin-top: 4px;
}
.cloak-target {
  padding: 8px 12px;
  margin: 6px 0;
  border: 1px solid #67e8f9;
  background: #ecfeff;
  border-radius: 4px;
}
.cloak-blue {
  border-color: #6366f1;
  background: #e0e7ff;
}
/* scoped 样式需要 :deep 命中 v-cloak（编译期保留属性） */
:deep([v-cloak]) {
  display: none;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
</style>
