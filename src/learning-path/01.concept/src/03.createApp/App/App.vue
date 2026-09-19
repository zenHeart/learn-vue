<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>Vue 版本：{{ vueVersion }}</p>
    <p>已注册组件：<code v-for="c in registered" :key="c">{{ c }} </code></p>
    <p>全局属性 greet 调用：<strong>{{ greet('World') }}</strong></p>
    <label>
      改 app.config.errorHandler：
      <input v-model="errorMsg" placeholder="错误处理文案" />
    </label>
    <p class="meta">
      完整链路：<code>createApp(App).use(router).provide('key', value).component('X', Comp).mount('#app')</code>
    </p>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'

const title = ref('createApp 应用实例')
const vueVersion = ref('3.x')
const registered = ref(['Counter'])
const errorMsg = ref('出错了，请稍后再试')

function greet(name) {
  return `Hello, ${name}!`
}

// 模拟 app.config / app.component / app.use / app.provide 字段
const instance = getCurrentInstance()
if (instance) {
  const app = instance.appContext.app
  vueVersion.value = app.version
  app.config.errorHandler = (err) => {
    console.warn('[demo]', errorMsg.value, err)
  }
  // 自定义全局属性
  app.config.globalProperties.$greet = greet
  // 注册组件演示
  if (!app._context.components['DemoCounter']) {
    app.component('DemoCounter', { template: '<button>counter</button>' })
    registered.value.push('DemoCounter')
  }
}
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
}
input {
  margin-left: 4px;
  padding: 2px 6px;
}
code {
  background: #e2e8f0;
  padding: 0 4px;
  border-radius: 3px;
}
.meta {
  margin-top: 10px;
  font-size: 12px;
  color: #64748b;
}
</style>