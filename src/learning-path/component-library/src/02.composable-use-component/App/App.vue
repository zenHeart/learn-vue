<script setup>
import { computed, ref, h, defineComponent } from 'vue'

// ---------- 1. Headless 核心：useToggle composable ----------
// 受控/非受控统一 + disabled 全局拦截
const useToggle = (props, emit) => {
  const internal = ref(props.defaultPressed ?? false)
  const pressed = computed({
    get: () => (props.pressed !== undefined ? props.pressed : internal.value),
    set: (v) => {
      if (props.disabled) return
      if (props.pressed === undefined) internal.value = v
      emit?.('update:pressed', v)
    },
  })
  const toggle = () => (pressed.value = !pressed.value)
  return { pressed, toggle }
}

// ---------- 2. Headless 组件：只负责 a11y + 行为 ----------
const ToggleHeadless = defineComponent({
  name: 'ToggleHeadless',
  props: {
    pressed: Boolean,
    defaultPressed: Boolean,
    disabled: Boolean,
    tag: { type: String, default: 'button' },
  },
  emits: ['update:pressed'],
  setup(props, { slots, emit }) {
    const { pressed, toggle } = useToggle(props, emit)
    return () => h(
      props.tag,
      {
        type: props.tag === 'button' ? 'button' : undefined,
        'aria-pressed': pressed.value,
        'data-state': pressed.value ? 'on' : 'off',
        'data-disabled': props.disabled || undefined,
        disabled: props.tag === 'button' ? props.disabled : undefined,
        onClick: toggle,
      },
      slots.default?.({ pressed: pressed.value })
    )
  },
})

// ---------- 3. 二次封装：自带样式的 Toggle ----------
// 在 headless 之上包一层 class —— 演示「核心零样式、样式可选」
const StyledToggle = defineComponent({
  name: 'StyledToggle',
  props: {
    pressed: Boolean,
    defaultPressed: Boolean,
    disabled: Boolean,
    label: { type: String, default: '开关' },
  },
  emits: ['update:pressed'],
  setup(props, { emit }) {
    return () => h('div', { class: 'styled-toggle' }, [
      h(ToggleHeadless, {
        ...props,
        'onUpdate:pressed': (v) => emit('update:pressed', v),
        tag: 'span',
      }, {
        default: ({ pressed }) => pressed ? 'ON' : 'OFF',
      }),
      h('span', { class: 'styled-toggle__label' }, props.label),
    ])
  },
})

// ---------- 4. 三种消费方式 ----------
const a = ref(false)
const b = ref(false)
const c = ref(false)
</script>

<template>
  <div class="demo">
    <p class="title">02 · Headless composable + 用户样式</p>

    <!-- 消费方式 ①：headless，DOM 完全由你控制 -->
    <section class="block">
      <p class="block-title">① 消费 headless：DOM 与样式完全自定义</p>
      <p class="hint">下面按钮没有 class —— 样式来自 <code>[data-state]</code> 选择器</p>
      <ToggleHeadless v-model:pressed="a">
        <template #default="{ pressed }">
          {{ pressed ? '订阅已开启' : '点击订阅' }}
        </template>
      </ToggleHeadless>
      <p class="meta">aria-pressed: <code>{{ a }}</code> · v-model:pressed 可双向绑定</p>
    </section>

    <!-- 消费方式 ②：二次封装得到「自带样式」 -->
    <section class="block">
      <p class="block-title">② 在 headless 之上包一层样式</p>
      <p class="hint">交互核心不变，样式你自己写 —— 跟 Element Plus 行为一致但样式自由</p>
      <StyledToggle v-model:pressed="b" label="深色模式" />
      <p class="meta">v-model:pressed = <code>{{ b }}</code></p>
    </section>

    <!-- 消费方式 ③：disabled + 受控 -->
    <section class="block">
      <p class="block-title">③ 受控 + disabled</p>
      <p class="hint">props.pressed 与 defaultPressed 不可同时给</p>
      <ToggleHeadless :pressed="c" disabled @update:pressed="(v) => c = v">
        <template #default="{ pressed }">
          {{ pressed ? '解锁' : '已禁用' }}
        </template>
      </ToggleHeadless>
      <p class="meta">disabled 时 <code>data-disabled=true</code> 拦截点击；外部可改 c 来受控</p>
    </section>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 640px; }
.title { font-weight: 700; font-size: 1rem; margin: 0 0 10px; }
.block { background: #fafbfc; border: 1px solid #e4e7ed; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
.block-title { font-weight: 600; font-size: 0.88rem; margin: 0 0 4px; }
.hint { font-size: 0.78rem; color: #888; margin: 0 0 8px; }
.meta { font-size: 0.76rem; color: #666; margin: 8px 0 0; }
code { background: #f6f8fa; padding: 1px 5px; border-radius: 3px; font-size: 0.78rem; }

/* 消费方式 ①：headless 用户的样式（用属性选择器） */
.block:first-of-type :deep(button) {
  padding: 8px 14px; border-radius: 6px; border: 1px solid #42b883;
  background: #fff; color: #42b883; cursor: pointer; font-size: 0.85rem;
  transition: background 0.15s, color 0.15s;
}
.block:first-of-type :deep(button[data-state="on"]) { background: #42b883; color: #fff; }
.block:first-of-type :deep(button[data-disabled]) { opacity: 0.5; cursor: not-allowed; }

/* 消费方式 ②：styled-toggle 封装 */
.styled-toggle { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.styled-toggle :deep(span[data-state]) {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 24px; border-radius: 12px; background: #dcdfe6;
  color: #fff; font-size: 0.7rem; font-weight: 700; transition: background 0.2s;
}
.styled-toggle :deep(span[data-state="on"]) { background: #409eff; }
.styled-toggle__label { font-size: 0.85rem; color: #303133; }
</style>
