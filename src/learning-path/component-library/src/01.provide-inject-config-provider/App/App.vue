<script setup>
import { computed, ref, h, defineComponent, inject, provide, getCurrentInstance } from 'vue'

// ---------- 1. 强类型 injection key 工厂 ----------
// Element Plus 风格：每个 context 一个 Symbol，避免字符串冲突
const sizeContextKey = Symbol('size')
const localeContextKey = Symbol('locale')
const namespaceContextKey = Symbol('namespace')
const configProviderContextKey = Symbol('configProvider')

// ---------- 2. provide 端：合并父子 config ----------
const useGlobalConfig = (key, defaultValue) => {
  const config = inject(configProviderContextKey)
  return computed(() => config.value?.[key] ?? defaultValue)
}

const provideGlobalConfig = (config) => {
  const instance = getCurrentInstance()
  const oldConfig = instance ? useGlobalConfig() : null

  // 合并：仅 undefined 字段继承父级
  const merged = computed(() => {
    const cfg = config.value
    if (!oldConfig?.value) return cfg
    const out = { ...oldConfig.value }
    for (const k in cfg) if (cfg[k] !== undefined) out[k] = cfg[k]
    return out
  })

  provide(configProviderContextKey, merged)
  provide(sizeContextKey, computed(() => merged.value.size))
  provide(localeContextKey, computed(() => merged.value.locale))
  provide(namespaceContextKey, computed(() => merged.value.namespace))
}

// ---------- 3. 子组件消费的 composable ----------
const useSize = () => inject(sizeContextKey, ref('default'))
const useLocale = () => inject(localeContextKey, ref('zh-CN'))
const useNamespace = () => inject(namespaceContextKey, ref('el'))

const ns = (block, nsRef) => {
  const prefix = nsRef.value
  return {
    b: () => `${prefix}-${block}`,
    m: (m) => m ? `${prefix}-${block}--${m}` : '',
    is: (state, value) => state ? `${prefix}-${block}--${value}` : '',
  }
}

// ---------- 4. ConfigProvider 组件 ----------
const ConfigProvider = defineComponent({
  name: 'DemoConfigProvider',
  props: {
    locale: String,
    size: String,
    namespace: String,
  },
  setup(props, { slots }) {
    const cfg = computed(() => ({
      locale: props.locale,
      size: props.size,
      namespace: props.namespace,
    }))
    provideGlobalConfig(cfg)
    return () => slots.default?.()
  },
})

// ---------- 5. 演示用 Button / Input ----------
const ElButton = defineComponent({
  name: 'DemoButton',
  props: {
    type: { type: String, default: 'default' },
  },
  setup(props, { slots }) {
    const size = useSize()
    const locale = useLocale()
    const nsRef = useNamespace()
    const cls = computed(() => {
      const n = ns('button', nsRef)
      return [n.b(), n.m(props.type), n.is(size.value && size.value !== 'default', size.value)]
    })
    return () => h(
      'button',
      { class: cls.value },
      [slots.default?.() ?? locale.value === 'zh-CN' ? '按钮' : 'Button']
    )
  },
})

const ElInput = defineComponent({
  name: 'DemoInput',
  props: { placeholder: String },
  setup(props) {
    const size = useSize()
    const nsRef = useNamespace()
    const cls = computed(() => [ns('input', nsRef).b(), ns('input', nsRef).m(size.value)])
    const ph = computed(() => props.placeholder ?? (useLocale().value === 'zh-CN' ? '请输入' : 'Type...'))
    return () => h('input', { class: cls.value, placeholder: ph.value })
  },
})

// ---------- 6. Demo 控制台 ----------
const outerLocale = ref('zh-CN')
const outerSize = ref('default')
const outerNs = ref('el')
const innerLocale = ref('en-US')
const innerSize = ref('small')
const innerNs = ref('acme')

const log = ref([])
const stamp = () => {
  log.value.unshift(`${new Date().toLocaleTimeString()} · size=${outerSize.value}/${innerSize.value}, ns=${outerNs.value}/${innerNs.value}`)
  if (log.value.length > 6) log.value.length = 6
}
</script>

<template>
  <div class="demo">
    <p class="title">01 · ConfigProvider provide/inject 模式</p>

    <div class="panel">
      <p class="panel-title">外层 ConfigProvider（站点级）</p>
      <div class="controls">
        <label>locale
          <select v-model="outerLocale">
            <option>zh-CN</option><option>en-US</option><option>ja-JP</option>
          </select>
        </label>
        <label>size
          <select v-model="outerSize">
            <option>small</option><option>default</option><option>large</option>
          </select>
        </label>
        <label>namespace
          <select v-model="outerNs">
            <option>el</option><option>acme</option><option>nn</option>
          </select>
        </label>
      </div>
    </div>

    <ConfigProvider :locale="outerLocale" :size="outerSize" :namespace="outerNs">
      <div class="row">
        <ElButton>提交</ElButton>
        <ElButton type="primary">确认</ElButton>
        <ElInput />
      </div>

      <div class="panel inner">
        <p class="panel-title">内层 ConfigProvider（嵌套）</p>
        <div class="controls">
          <label>locale
            <select v-model="innerLocale">
              <option>zh-CN</option><option>en-US</option><option>ja-JP</option>
            </select>
          </label>
          <label>size
            <select v-model="innerSize">
              <option>small</option><option>default</option><option>large</option>
            </select>
          </label>
          <label>namespace
            <select v-model="innerNs">
              <option>el</option><option>acme</option><option>nn</option>
            </select>
          </label>
        </div>
      </div>

      <ConfigProvider :locale="innerLocale" :size="innerSize" :namespace="innerNs">
        <div class="row inner-row">
          <ElButton>Submit</ElButton>
          <ElButton type="primary">Confirm</ElButton>
          <ElInput />
        </div>
      </ConfigProvider>
    </ConfigProvider>

    <div class="hints">
      <p class="hint">观察</p>
      <ul>
        <li>外层按钮类名 <code>el-button</code>，内层按钮类名 <code>acme-button</code> —— <strong>namespace 字段独立注入</strong></li>
        <li>外层 <code>large</code>，内层 <code>small</code> —— <strong>size 字段独立注入</strong></li>
        <li>外层中文「提交」，内层英文「Submit」 —— <strong>locale 字段独立注入</strong></li>
        <li>CSS 中 <code>.el-button</code> / <code>.acme-button</code> / <code>--nn-button</code> 三套规则都生效 —— 演示了 Element Plus 风格「按字段拆 key」的好处</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 640px; }
.title { font-weight: 700; font-size: 1rem; margin: 0 0 10px; }
.panel { border: 1px solid #dcdfe6; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; background: #fafbfc; }
.panel.inner { background: #fff7e6; border-color: #ffd591; }
.panel-title { margin: 0 0 8px; font-size: 0.85rem; font-weight: 600; color: #555; }
.controls { display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.82rem; }
.controls label { display: flex; align-items: center; gap: 4px; }
select { padding: 3px 6px; border-radius: 4px; border: 1px solid #dcdfe6; background: #fff; font-size: 0.82rem; }
.row { display: flex; gap: 8px; align-items: center; padding: 10px 0; border-top: 1px dashed #eee; }
.row.inner-row { background: rgba(255, 247, 230, 0.4); padding: 8px; border-radius: 6px; }
.hints { margin-top: 12px; font-size: 0.78rem; color: #666; }
.hints ul { margin: 4px 0 0; padding-left: 20px; line-height: 1.7; }
.hint { font-weight: 600; color: #444; margin: 0; }
code { background: #f6f8fa; padding: 1px 5px; border-radius: 3px; font-size: 0.78rem; }

/* Element Plus 风格 BEM */
:deep(.el-button) { padding: 8px 16px; border-radius: 4px; border: 1px solid #dcdfe6; background: #fff; cursor: pointer; font-size: 0.85rem; }
:deep(.el-button--primary) { background: #409eff; color: #fff; border-color: #409eff; }
:deep(.el-button--large) { padding: 12px 20px; font-size: 0.95rem; }
:deep(.el-button--small) { padding: 5px 10px; font-size: 0.75rem; }
:deep(.el-input) { padding: 8px 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; flex: 1; }
:deep(.el-input--small) { padding: 5px 8px; font-size: 0.78rem; }
:deep(.el-input--large) { padding: 12px 16px; font-size: 0.95rem; }

/* acme 命名空间完全独立 */
:deep(.acme-button) { padding: 6px 10px; border-radius: 12px; border: 1px solid #7c3aed; background: #f3e8ff; cursor: pointer; font-size: 0.78rem; color: #5b21b6; }
:deep(.acme-button--primary) { background: #7c3aed; color: #fff; border-color: #7c3aed; }
:deep(.acme-button--small) { padding: 3px 8px; font-size: 0.7rem; }
:deep(.acme-input) { padding: 5px 8px; border: 1px solid #7c3aed; border-radius: 8px; background: #faf5ff; flex: 1; font-size: 0.78rem; }
</style>
