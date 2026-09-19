<template>
  <div class="demo">
    <h2>21 · compiler-sfc 宏编译：defineProps / withDefaults</h2>

    <section class="card">
      <h3>① 用户视角：defineProps&lt;T&gt; + withDefaults</h3>
      <PropsDemo :count="3" mode="auto" />
      <PropsDemo :count="10" />
    </section>

    <section class="card">
      <h3>② 编译器视角：编译后产物（手写简化版）</h3>
      <p class="hint">以下 JS 是 <code>@vue/compiler-sfc</code> 对宏做展开后的伪代码（去掉 reactive destructure、generic 等扩展）。</p>
      <pre class="code">{{ compiledSource }}</pre>
    </section>

    <section class="card">
      <h3>③ trace：运行时 props 校验与默认值</h3>
      <button @click="log = ''">清空</button>
      <pre class="code">{{ log }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PropsDemo from './PropsDemo.vue'

const log = ref<string>('')

// 编译结果示意（手写简化版）
const compiledSource = `// 源码
<script setup lang="ts">
import { ref } from 'vue'
const props = withDefaults(
  defineProps<{ count?: number; mode?: string }>(),
  { count: 0, mode: 'auto' }
)
const emit = defineEmits<{ change: [v: string] }>()
const n = ref(props.count)
</script>

// compiler-sfc 编译产物（简化）
<script>
import { defineComponent as _defineComponent } from 'vue'
import { ref as _ref } from 'vue'

export default _defineComponent({
  emits: ['change'],
  props: {
    count: { default: 0 },
    mode:  { default: 'auto' }
  },
  setup(__props, { emit }) {
    const props = __props
    const n = _ref(props.count)
    return { n, emit }
  }
})
</script>`

onMounted(() => {
  log.value += '[onMounted] 父组件挂载完成\n'
  log.value += '[hint] 浏览器内不能直接 import @vue/compiler-sfc（依赖 Node API），\n'
  log.value += '       上方"手写简化版"展示宏展开；运行时仍能看到 props 默认值生效。\n'
})
</script>

<style scoped>
.demo { max-width: 880px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #555; margin-bottom: 6px; }
.code { background: #1e1e1e; color: #d4d4d4; padding: 10px; font-size: 12px; border-radius: 4px; overflow: auto; white-space: pre-wrap; max-height: 320px; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
code { background: #f6f8fa; padding: 1px 4px; border-radius: 3px; }
</style>
