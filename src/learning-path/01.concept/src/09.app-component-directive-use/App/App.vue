<template>
  <div class="demo">
    <h3>app.component / app.directive / app.use 全局注册</h3>

    <section class="card">
      <h4>① app.component('DemoButton', ...)</h4>
      <p class="hint">组件一旦全局注册，模板可直接写 <code>&lt;DemoButton /&gt;</code>，不需要 import。</p>
      <DemoButton label="全局组件" @click="onClick" />
      <p>点击次数：{{ count }}</p>
    </section>

    <section class="card">
      <h4>② app.directive('highlight', ...)</h4>
      <p class="hint">全局指令注册后，所有组件都能用 <code>v-highlight</code>。</p>
      <p v-highlight>这段文字被自定义指令高亮（蓝色背景）</p>
      <input v-focus placeholder="挂载时自动聚焦" />
    </section>

    <section class="card">
      <h4>③ app.use(MyPlugin)</h4>
      <p class="hint">插件通过 <code>install(app, options)</code> 批量注册组件 / 指令 / provide。</p>
      <p>插件注入的全局方法：<code>{{ pluginMsg }}</code></p>
      <p>插件注册的全局组件：<code>&lt;PluginBadge /&gt;</code></p>
      <PluginBadge text="来自插件" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted, type Directive } from 'vue'

const count = ref(0)
const pluginMsg = ref('')
const onClick = () => count.value++

// ② 自定义指令
const vHighlight: Directive<HTMLElement> = {
  mounted(el) {
    el.style.background = '#eef2ff'
    el.style.padding = '4px 8px'
    el.style.borderRadius = '4px'
  },
}

const vFocus: Directive<HTMLElement> = {
  mounted(el) {
    el.focus()
  },
}

onMounted(() => {
  const inst = getCurrentInstance()
  if (!inst) return
  const app = inst.appContext.app as any

  // ① 全局注册组件
  if (!app._context.components['DemoButton']) {
    app.component('DemoButton', {
      props: ['label'],
      emits: ['click'],
      template: `<button @click="$emit('click')">{{ label }}</button>`,
    })
  }

  // ③ 模拟一个插件
  if (!app.config.globalProperties.$pluginInjected) {
    const MyPlugin = {
      install(app: any) {
        app.component('PluginBadge', {
          props: ['text'],
          template: `<span class="badge">{{ text }}</span>`,
        })
        app.config.globalProperties.$pluginInjected = 'install OK'
      },
    }
    app.use(MyPlugin)
  }

  pluginMsg.value = app.config.globalProperties.$pluginInjected ?? ''
})
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h4 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 8px; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: 12px; }
button { padding: 4px 12px; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; cursor: pointer; }
input { padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; }
.badge {
  display: inline-block;
  padding: 2px 8px;
  background: #dcfce7;
  color: #166534;
  border-radius: 10px;
  font-size: 12px;
}
</style>