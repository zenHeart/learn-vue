<script setup>
import { ref, computed } from 'vue'

const user = ref({
  firstName: '张',
  lastName: '三',
  role: 'developer',
  level: 3,
  active: true,
  lastLogin: Date.now(),
  description: 'demo user',
})

// ① 模板表达式：每次 update 都重新执行
// 模板里直接组合 user.firstName + user.lastName + ...

// ② computed：缓存派生
const fullName = computed(() => `${user.value.firstName}-${user.value.lastName}`)
const badge = computed(() => `${user.value.role.toUpperCase()}: L${user.value.level}`)
const trackedDeps = computed(() => {
  const deps = new Set()
  return computed(() => {
    deps.add('firstName'); deps.add('lastName'); deps.add('role'); deps.add('level')
    return `${user.value.firstName}${user.value.lastName}${user.value.role}${user.value.level}`
  }, {
    onTrack(e) { deps.add(e.key) },
  }).value
})

// 用一个 counter 数「组件 update 次数」——通过 watchEffect 间接测量
const updateCount = ref(0)
import { watchEffect, onMounted } from 'vue'
onMounted(() => {
  watchEffect(() => {
    // 触发一次模板表达式路径的依赖收集
    `${user.value.firstName}${user.value.lastName}${user.value.role}${user.value.level}${user.value.active}${user.value.lastLogin}${user.value.description}`
    updateCount.value++
  })
})

const depCount = ref(0)
function countDeps() {
  const deps = new Set()
  const probe = computed(() => {
    void fullName.value
    void badge.value
  }, {
    onTrack(e) { deps.add(`${String(e.target?.type ?? '')}.${String(e.key)}`) },
  })
  void probe.value
  depCount.value = deps.size
}

function bumpField() {
  user.value.level++
}

function replaceUser() {
  user.value = { ...user.value, level: user.value.level + 1, lastLogin: Date.now() }
}
</script>

<template>
  <div class="demo">
    <p class="badge">模板表达式 vs computed</p>

    <div class="user-card">
      <div class="line">姓名: {{ user.firstName }}-{{ user.lastName }}</div>
      <div class="line">角色: {{ user.role.toUpperCase() }}: L{{ user.level }}</div>
      <div class="line computed-line">缓存路径: {{ fullName }} / {{ badge }}</div>
    </div>

    <div class="metrics">
      <div class="metric">
        <span class="label">组件 update 计数</span>
        <span class="value">{{ updateCount }}</span>
      </div>
      <div class="metric">
        <span class="label">computed 依赖数</span>
        <span class="value">{{ depCount }}</span>
      </div>
    </div>

    <div class="actions">
      <button @click="bumpField">修改 level</button>
      <button @click="replaceUser">整体替换 user</button>
      <button class="primary" @click="countDeps">数依赖</button>
    </div>

    <p class="tip">
      修改 level 都会触发模板表达式重算；computed 路径在依赖未变时直接返回缓存。
    </p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.user-card { background: #f6f8fa; padding: 12px; border-radius: 8px; margin-bottom: 10px; }
.line { font-size: 0.9rem; padding: 2px 0; }
.computed-line { color: #2c8e63; font-weight: 600; }
.metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 10px; }
.metric { background: #f6f8fa; border-radius: 8px; padding: 8px 10px; }
.label { display: block; font-size: 0.7rem; color: #888; }
.value { display: block; font-size: 1.2rem; font-weight: 700; margin-top: 2px; }
.actions { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
button { padding: 5px 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.8rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.tip { font-size: 0.78rem; color: #666; margin: 0; }
</style>
