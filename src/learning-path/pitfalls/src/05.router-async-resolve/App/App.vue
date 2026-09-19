<script setup>
import { ref, computed } from 'vue'

const mode = ref('static')
const logs = ref([])
function log(m) { logs.value.unshift(m); if (logs.value.length > 8) logs.value.length = 8 }

const routes = computed(() => {
  if (mode.value === 'static') {
    return [
      { path: '/home', component: 'HomePage', note: '静态引用，Vite 全量打包' },
      { path: '/about', component: 'AboutPage', note: '同上' },
    ]
  }
  if (mode.value === 'broken') {
    return [
      { path: '/home', component: "() => import('./HomePAge.vue')", note: '大小写错，运行时 chunk 加载失败' },
    ]
  }
  return [
    { path: '/home', component: "() => import('./HomePage.vue')", note: 'Vite 拆为单独 chunk' },
    { path: '/about', component: "() => import('./AboutPage.vue')", note: '按需加载' },
  ]
})

function simulate(route) {
  if (route.component.startsWith('() => import')) {
    const path = route.component.match(/'([^']+)'/)?.[1] || ''
    if (path.includes('PAge')) {
      log(`✗ ${route.path} 加载失败：找不到 ${path}`)
    } else {
      log(`✓ ${route.path} 触发动态 import：${path} 拆为独立 chunk`)
    }
  } else {
    log(`! ${route.path} 静态引用 → 进入主 bundle`)
  }
}
</script>

<template>
  <div class="demo">
    <p class="badge">路由懒加载</p>

    <div class="switch">
      <button :class="{ active: mode === 'static' }" @click="mode = 'static'">① 静态字符串引用</button>
      <button :class="{ active: mode === 'broken' }" @click="mode = 'broken'">② 错误路径</button>
      <button :class="{ active: mode === 'lazy' }" @click="mode = 'lazy'">③ 正确懒加载</button>
    </div>

    <table>
      <thead><tr><th>path</th><th>component</th><th>点击模拟</th></tr></thead>
      <tbody>
        <tr v-for="r in routes" :key="r.path">
          <td><code>{{ r.path }}</code></td>
          <td><code>{{ r.component }}</code></td>
          <td><button @click="simulate(r)">进入</button></td>
        </tr>
      </tbody>
    </table>

    <ul class="log">
      <li v-for="(l, i) in logs" :key="i">{{ l }}</li>
    </ul>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 540px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fdecea; color: #c0392b; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.switch { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
.switch button { flex: 1; padding: 5px 8px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.72rem; }
.switch button.active { background: #42b883; color: #fff; border-color: #42b883; }
table { width: 100%; border-collapse: collapse; font-size: 0.74rem; margin-bottom: 8px; }
th, td { padding: 4px 8px; border-bottom: 1px solid #f0f0f0; text-align: left; }
code { background: #f6f8fa; padding: 1px 6px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.9em; }
button { padding: 3px 8px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer; font-size: 0.74rem; }
.log { list-style: none; padding: 6px 10px; margin: 0; background: #f6f8fa; border-radius: 6px; font-size: 0.72rem; max-height: 140px; overflow-y: auto; font-family: ui-monospace, monospace; }
.log li { padding: 1px 0; }
</style>
