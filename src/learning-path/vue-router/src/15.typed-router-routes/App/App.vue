<template>
  <div class="app">
    <h2>typed-routes · 强类型 Router</h2>
    <p class="hint">
      打开 App.vue / User.vue 注释看类型错误的写法;DevTools 里检查 <code>__router__.currentRoute.value.params</code>。
    </p>
    <nav>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/users/42">/users/42</RouterLink>
    </nav>
    <button @click="goTyped">用强类型 push</button>
    <button @click="goUntyped">注释掉 demo 类型,这里会报错</button>
    <router-view />
  </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

function goTyped() {
  // 正确写法:id 是 string
  router.push({ name: 'user', params: { id: '42' }, query: { ref: 'home' } })
}

// 注释掉 demo 用的 RouteMap 后,这段在 IDE 里会立刻画红线
// function goUntyped() {
//   router.push({ name: 'user', params: { id: 42 } }) // 类型 'number' 不可赋给 'string'
// }
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app :deep(code) { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
.app nav { display: flex; gap: .8rem; margin: .5rem 0 1rem; }
.app button { padding: .25rem .6rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; margin-right: .4rem; }
.app :deep(.params) { background: #f6f8fa; padding: .6rem; border-radius: 4px; }
</style>
