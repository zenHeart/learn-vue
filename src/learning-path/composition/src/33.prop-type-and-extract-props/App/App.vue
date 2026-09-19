<template>
  <div class="demo">
    <h2>PropType + ExtractPropTypes</h2>
    <p class="hint">
      用运行时 props 选项声明 + PropType 标注 + ExtractPropTypes 提取，演示
      复杂对象类型如何同时获得 IDE 提示与运行时校验。
    </p>

    <section class="card">
      <h3>① 列表渲染（PropType&lt;User[]&gt;）</h3>
      <UserList :users="users" :columns="columns" />
      <p class="hint">UserList 的 props 是从 PropType + ExtractPropTypes 推导出来的</p>
    </section>

    <section class="card">
      <h3>② 单独的 prop 提取</h3>
      <SinglePropDemo :tag="{ id: 1, label: 'frontend' }" />
      <p class="hint">用 ExtractPropTypes&lt;typeof tagProp&gt; 推导单字段类型</p>
    </section>

    <section class="card">
      <h3>③ ExtractPublicPropTypes</h3>
      <PublicApiDemo :title="'公开 API'" :count="42" />
      <p class="hint">publicProps 用 ExtractPublicPropTypes 提取，过滤掉 _internal*</p>
    </section>

    <section class="card">
      <h3>④ JSX/TSX 复用 SFC props</h3>
      <pre class="code"><code>// 实际效果：JSX 里也可以用同一个 props 类型
// &lt;UserList {...userListProps} users={[...]} columns={[...]} /&gt;</code></pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PropType, ExtractPropTypes, ExtractPublicPropTypes } from 'vue'
import UserList from './UserList.vue'
import SinglePropDemo from './SinglePropDemo.vue'
import PublicApiDemo from './PublicApiDemo.vue'

interface User {
  id: number
  name: string
  email: string
}

interface Column {
  key: string
  label: string
  width?: number
}

// 在 setup 里演示 ExtractPropTypes 推导
// 这里复刻 UserList 内部的 props 选项，只用作类型演示
const userListPropsDef = {
  users: { type: Array as PropType<User[]>, required: true as const },
  columns: { type: Array as PropType<Column[]>, default: () => [] as Column[] },
} as const

type Inferred = ExtractPropTypes<typeof userListPropsDef>
// 鼠标悬停 Inferred 查看推导结果：{ users: User[]; columns?: Column[] }

const users = ref<User[]>([
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
])

const columns = ref<Column[]>([
  { key: 'id', label: 'ID', width: 60 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'email', label: '邮箱' },
])

// 单字段 prop 提取演示
const tagProp = { tag: { type: Object as PropType<{ id: number; label: string }> } } as const
type TagOnly = ExtractPropTypes<typeof tagProp>['tag']
// TagOnly = { id: number; label: string } | undefined

// Public API 演示
const publicPropsDef = {
  title: { type: String, required: true as const },
  count: { type: Number, default: 0 },
  _internalCache: { type: Object as PropType<Map<string, unknown>>, default: () => new Map() },
  _internalKey: { type: String, default: '' },
} as const

// ExtractPublicPropTypes 自动过滤掉以 _ 开头的 prop
type PublicApi = ExtractPublicPropTypes<typeof publicPropsDef>
// 鼠标悬停查看：{ title: string; count: number }
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0; font-size: 12px; color: #666; }
.code {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  overflow-x: auto;
}
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
</style>