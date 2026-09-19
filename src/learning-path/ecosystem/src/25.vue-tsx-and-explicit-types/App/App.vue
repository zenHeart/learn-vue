<template>
  <div class="demo">
    <h2>Vue TSX · defineComponent 显式类型</h2>
    <p class="hint">
      TSX 风格写组件：JSX 渲染函数 + 显式 <code>defineComponent</code>。
      与 SFC 的核心差异是模板语法换成了 JSX 表达式，其他生命周期、
      类型推断、props / emits 完全一致。
    </p>

    <section class="card">
      <h3>① 列表渲染（TSX）</h3>
      <UserList :users="users" :title="'团队成员'" @select="onSelect" />
      <p class="hint">用户列表完全用 TSX 写：<code>App/UserList.tsx</code></p>
    </section>

    <section class="card">
      <h3>② v-model 在 TSX 里的写法</h3>
      <input
        :value="searchTerm"
        @input="(e: any) => (searchTerm = e.target.value)"
        placeholder="搜索姓名"
      />
      <p>当前输入：{{ searchTerm }}</p>
      <p class="hint">JSX 里 v-model 拆成 <code>:value</code> + <code>@input</code>，或用 <code>vModelText</code> helper</p>
    </section>

    <section class="card">
      <h3>③ 类型推导示意</h3>
      <pre class="code"><code>// UserList.tsx 内部：
// const selectedId: Ref&lt;number | null&gt; = ref(null)
//
// emit 类型：{ select: (id: number) =&gt; void }
// props.users 类型：User[]（来自 PropType&lt;User[]&gt;）
// 模板里 this.selectedId 也会被推断为 number | null</code></pre>
    </section>

    <section class="card">
      <h3>④ SFC vs TSX 适用场景</h3>
      <table>
        <thead>
          <tr><th>场景</th><th>推荐</th></tr>
        </thead>
        <tbody>
          <tr><td>页面布局 / 长模板</td><td>SFC</td></tr>
          <tr><td>递归组件 / 复杂条件渲染</td><td>TSX</td></tr>
          <tr><td>scoped 样式依赖</td><td>SFC</td></tr>
          <tr><td>跨 React 协作</td><td>TSX</td></tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserList from './UserList'

const searchTerm = ref('')

const users = ref([
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
])

function onSelect(id: number) {
  console.log('选中用户', id)
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0; font-size: 12px; color: #666; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.code { background: #1e1e1e; color: #d4d4d4; padding: 8px; border-radius: 4px; font-size: 11px; overflow-x: auto; }
input { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; width: 100%; max-width: 300px; font-size: 13px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { padding: 6px 10px; border: 1px solid #e2e8f0; text-align: left; }
th { background: #f8fafc; }
</style>

<style>
.user-list { font-family: system-ui, sans-serif; }
.user-list ul { list-style: none; padding: 0; margin: 0; }
.user-list li {
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  gap: 12px;
  align-items: center;
}
.user-list li:hover { background: #f1f5f9; }
.user-list li.active { background: #42b883; color: #fff; }
.user-list li.active .email { color: rgba(255,255,255,0.85); }
.user-list li.disabled { cursor: not-allowed; opacity: 0.6; }
.user-list .email { color: #64748b; font-size: 12px; }
</style>