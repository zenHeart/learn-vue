<template>
  <div class="demo">
    <h2>Volar + vue-tsc · 类型工作流</h2>
    <p class="hint">
      这个 demo 模拟一个真实的"类型驱动"组件：故意制造可被 IDE 检测到的类型错误，
      演示 Volar 的实时提示 + vue-tsc 的命令行检查。
    </p>

    <section class="card">
      <h3>① 正常的 prop 类型检查</h3>
      <TypedCounter :start="10" :step="2" />
      <p class="hint">Volar 会把 start / step 推断为 number；非法赋值会即时红线</p>
    </section>

    <section class="card">
      <h3>② emit 类型检查</h3>
      <EmitDemo @change="(v: number) => (lastEmit = v)" />
      <p class="hint">Volar 会校验 emit 的 payload 类型：<code>change: number</code></p>
      <p>最近一次 emit: {{ lastEmit }}</p>
    </section>

    <section class="card">
      <h3>③ vue-tsc vs tsc 输出对比</h3>
      <pre class="code"><code># 标准 tsc 输出
$ tsc --noEmit
✓ 0 errors (但 .vue 文件未检查！)

# vue-tsc 输出
$ vue-tsc --noEmit
src/components/TypedCounter.vue:5:7 - error TS2322:
  Type 'string' is not assignable to type 'number'.

Found 1 error in 1 file.</code></pre>
    </section>

    <section class="card">
      <h3>④ 关键 tsconfig 字段</h3>
      <table>
        <thead>
          <tr><th>字段</th><th>作用</th></tr>
        </thead>
        <tbody>
          <tr><td><code>moduleResolution: "Bundler"</code></td><td>Vite/Webpack 5 推荐配置</td></tr>
          <tr><td><code>jsx: "preserve"</code></td><td>让 Vue 3 JSX 不被当 React</td></tr>
          <tr><td><code>types: ["vite/client"]</code></td><td>让 <code>*.vue</code> import 被识别</td></tr>
          <tr><td><code>include: ["src/**/*.vue"]</code></td><td>vue-tsc 必须包含</td></tr>
          <tr><td><code>vueCompilerOptions.skipTemplateCodegen</code></td><td>关闭 template 类型检查（提速）</td></tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h3>⑤ 完整 CI 流程</h3>
      <pre class="code"><code># .github/workflows/ci.yml
- run: pnpm install
- run: pnpm lint
- run: pnpm vue-tsc --noEmit    # 类型检查
- run: pnpm vitest run          # 单元测试
- run: pnpm build               # 构建产物</code></pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TypedCounter from './TypedCounter.vue'
import EmitDemo from './EmitDemo.vue'

const lastEmit = ref<number | null>(null)
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0; font-size: 12px; color: #666; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.code { background: #1e1e1e; color: #d4d4d4; padding: 8px; border-radius: 4px; font-size: 11px; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th, td { padding: 5px 8px; border: 1px solid #e2e8f0; text-align: left; }
th { background: #f8fafc; font-weight: 600; }
</style>