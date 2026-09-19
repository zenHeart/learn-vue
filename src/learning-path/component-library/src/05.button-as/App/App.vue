<script setup>
import { ref, computed, h, defineComponent } from 'vue'

// ---------- 1. 强类型 polymorphic 工厂 ----------
// 类似 Element Plus 与 Reka UI 的模式：tag prop + props 透传
const createPolymorphic = (defaultTag = 'button') => defineComponent({
  name: 'AppButton',
  props: {
    tag: { type: String, default: defaultTag },
    variant: { type: String, default: 'default' },     // primary | default | ghost
    size: { type: String, default: 'default' },       // small | default | large
    href: String,
    to: String,                                       // router-link 模拟
    target: String,
    disabled: Boolean,
  },
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const cls = computed(() => [
      'poly-btn',
      `poly-btn--${props.variant}`,
      `poly-btn--${props.size}`,
      { 'is-disabled': props.disabled },
    ])

    const handleClick = (e) => {
      if (props.disabled) {
        e.preventDefault()
        e.stopImmediatePropagation()
        return
      }
      emit('click', e)
    }

    return () => {
      const tag = props.tag
      // 模拟 router-link：实际路由组件带 to prop
      if (tag === 'router-link') {
        return h('a', {
          class: cls.value,
          href: props.to,
          onClick: (e) => {
            e.preventDefault()  // 阻止真实跳转
            handleClick(e)
          },
        }, slots.default?.())
      }
      if (tag === 'a') {
        return h('a', {
          class: cls.value,
          href: props.href,
          target: props.target,
          rel: props.target === '_blank' ? 'noopener' : undefined,
          'aria-disabled': props.disabled || undefined,
          onClick: handleClick,
        }, slots.default?.())
      }
      // 默认 button
      return h(tag, {
        class: cls.value,
        type: tag === 'button' ? 'button' : undefined,
        disabled: props.disabled,
        onClick: handleClick,
      }, slots.default?.())
    }
  },
})

const AppButton = createPolymorphic('button')

// ---------- 2. Demo 控制台 ----------
const tag = ref('button')
const variant = ref('primary')
const size = ref('default')
const href = ref('https://example.com')
const to = ref('/home')
const disabled = ref(false)
const clickLog = ref([])

const onClick = (e) => {
  clickLog.value.unshift(`[${new Date().toLocaleTimeString()}] tag=${tag.value} target=${e.target.tagName}`)
  if (clickLog.value.length > 5) clickLog.value.length = 5
}
</script>

<template>
  <div class="demo">
    <p class="title">05 · 多态组件（Polymorphic <code>tag</code> / <code>as</code>）</p>

    <div class="panel">
      <p class="panel-title">组件配置</p>
      <div class="grid">
        <label>tag
          <select v-model="tag">
            <option value="button">button</option>
            <option value="a">a (链接)</option>
            <option value="router-link">router-link</option>
            <option value="div">div</option>
          </select>
        </label>
        <label>variant
          <select v-model="variant">
            <option value="primary">primary</option>
            <option value="default">default</option>
            <option value="ghost">ghost</option>
          </select>
        </label>
        <label>size
          <select v-model="size">
            <option value="small">small</option>
            <option value="default">default</option>
            <option value="large">large</option>
          </select>
        </label>
        <label>disabled
          <input type="checkbox" v-model="disabled" />
        </label>
        <label v-if="tag === 'a'">href
          <input type="text" v-model="href" />
        </label>
        <label v-if="tag === 'router-link'">to
          <input type="text" v-model="to" />
        </label>
      </div>
    </div>

    <div class="preview">
      <p class="preview-label">实时渲染（点击会写日志）：</p>
      <AppButton
        :tag="tag"
        :variant="variant"
        :size="size"
        :disabled="disabled"
        :href="tag === 'a' ? href : undefined"
        :to="tag === 'router-link' ? to : undefined"
        @click="onClick"
      >
        <span v-if="tag === 'button'">原生按钮</span>
        <span v-else-if="tag === 'a'">链接（{{ href }}）</span>
        <span v-else-if="tag === 'router-link'">导航（{{ to }}）</span>
        <span v-else>div 容器</span>
      </AppButton>
    </div>

    <div class="log">
      <p class="panel-title">点击日志</p>
      <ul>
        <li v-for="(line, i) in clickLog" :key="i">{{ line }}</li>
        <li v-if="!clickLog.length" class="empty">尚无点击</li>
      </ul>
    </div>

    <div class="hints">
      <p class="hint">观察</p>
      <ul>
        <li><code>tag="button"</code> → 原生 button 行为，<code>disabled</code> 生效</li>
        <li><code>tag="a"</code> → 暴露 <code>href</code> 属性，点击跳转（在新 tab 看）</li>
        <li><code>tag="router-link"</code> → 暴露 <code>to</code> 属性，不真正跳转（演示用 <code>preventDefault</code>）</li>
        <li><code>tag="div"</code> → 不接受 <code>href</code>，TS 类型推断会报错（见 description）</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 640px; }
.title { font-weight: 700; font-size: 1rem; margin: 0 0 10px; }
.title code { font-size: 0.9rem; }
.panel { background: #f6f8fa; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
.panel-title { margin: 0 0 8px; font-size: 0.85rem; font-weight: 600; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 12px; font-size: 0.82rem; }
.grid label { display: flex; align-items: center; gap: 6px; }
.grid select, .grid input[type="text"] { flex: 1; padding: 4px 6px; border-radius: 4px; border: 1px solid #dcdfe6; font-size: 0.82rem; }
.preview { background: #fff; border: 1px solid #e4e7ed; border-radius: 8px; padding: 16px; margin-bottom: 10px; text-align: center; }
.preview-label { font-size: 0.78rem; color: #888; margin: 0 0 10px; }
.log { background: #1f2937; color: #d1d5db; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
.log .panel-title { color: #f3f4f6; }
.log ul { margin: 0; padding-left: 16px; font-size: 0.76rem; line-height: 1.7; font-family: ui-monospace, monospace; }
.log .empty { color: #6b7280; font-style: italic; list-style: none; }
.hints { font-size: 0.78rem; color: #666; }
.hints ul { margin: 4px 0 0; padding-left: 20px; line-height: 1.7; }
.hint { font-weight: 600; margin: 0; }
code { background: #f6f8fa; padding: 1px 5px; border-radius: 3px; font-size: 0.78rem; color: #5b21b6; }

/* Element Plus 风格样式：通过 tag 属性选择，:deep 让多态元素都生效 */
:deep(.poly-btn) { display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 8px 16px; border-radius: 4px; border: 1px solid transparent; cursor: pointer; font-size: 0.85rem; text-decoration: none; transition: background 0.15s, transform 0.1s; }
:deep(.poly-btn--small) { padding: 4px 10px; font-size: 0.75rem; }
:deep(.poly-btn--large) { padding: 12px 20px; font-size: 0.95rem; }
:deep(.poly-btn--primary) { background: #409eff; color: #fff; border-color: #409eff; }
:deep(.poly-btn--primary:hover) { background: #66b1ff; border-color: #66b1ff; }
:deep(.poly-btn--default) { background: #fff; color: #409eff; border-color: #d9ecff; }
:deep(.poly-btn--default:hover) { color: #66b1ff; border-color: #66b1ff; background: #ecf5ff; }
:deep(.poly-btn--ghost) { background: transparent; color: #409eff; border-color: transparent; }
:deep(.poly-btn--ghost:hover) { color: #66b1ff; background: #ecf5ff; }
:deep(.poly-btn:active) { transform: scale(0.97); }
:deep(.poly-btn.is-disabled) { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
</style>
