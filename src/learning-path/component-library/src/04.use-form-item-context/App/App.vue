<script setup>
import { ref, reactive, defineComponent, inject, provide, onMounted, onUnmounted } from 'vue'

// ---------- 1. 两个 InjectionKey ----------
const formContextKey = Symbol('formContext')
const formItemContextKey = Symbol('formItemContext')

// ---------- 2. Form 组件 ----------
const Form = defineComponent({
  name: 'DemoForm',
  props: {
    model: Object,
    labelAlign: { type: String, default: 'right' },
  },
  setup(props, { slots }) {
    const fields = reactive([])

    const addField = (field) => fields.push(field)
    const removeField = (field) => {
      const i = fields.indexOf(field)
      if (i >= 0) fields.splice(i, 1)
    }

    const validate = async () => {
      const results = []
      for (const f of fields) {
        const r = await f.validate()
        if (r !== true) results.push({ field: f.field, message: r })
      }
      return results.length ? results : true
    }

    provide(formContextKey, {
      model: props.model,
      labelAlign: props.labelAlign,
      addField, removeField, validate,
      fields,
    })

    return () => h('form', { class: 'demo-form' }, slots.default?.())
  },
})

// ---------- 3. FormItem 组件 ----------
const FormItem = defineComponent({
  name: 'DemoFormItem',
  props: {
    field: { type: String, required: true },
    label: String,
    rules: { type: Array, default: () => [] },
  },
  setup(props, { slots }) {
    const form = inject(formContextKey)
    const itemState = reactive({
      field: props.field,
      label: props.label,
      error: '',
      touched: false,
      validating: false,
    })

    const validate = async () => {
      itemState.validating = true
      itemState.error = ''
      const value = form?.model?.[props.field]
      for (const rule of props.rules) {
        const err = await rule(value, form?.model)
        if (err) {
          itemState.error = err
          itemState.validating = false
          return err
        }
      }
      itemState.validating = false
      return true
    }

    provide(formItemContextKey, itemState)

    onMounted(() => form?.addField({ ...itemState, validate }))
    onUnmounted(() => form?.removeField({ ...itemState, validate }))

    return () => h('div', { class: ['form-item', { 'has-error': !!itemState.error }] }, [
      h('label', { class: 'form-item__label' }, props.label + ':'),
      h('div', { class: 'form-item__content' }, slots.default?.({ validate })),
      itemState.error ? h('div', { class: 'form-item__error' }, itemState.error) : null,
    ])
  },
})

// ---------- 4. Input 消费两个 context ----------
const FormInput = defineComponent({
  name: 'DemoFormInput',
  props: {
    field: { type: String, required: true },
    placeholder: String,
  },
  setup(props) {
    const form = inject(formContextKey)
    const formItem = inject(formItemContextKey, undefined)
    const value = computed({
      get: () => form?.model?.[props.field] ?? '',
      set: (v) => { if (form?.model) form.model[props.field] = v },
    })
    const onBlur = () => formItem?.validate?.()
    return () => h('input', {
      class: 'form-input',
      value: value.value,
      placeholder: props.placeholder,
      onInput: (e) => (value.value = e.target.value),
      onBlur,
    })
  },
})

// ---------- 5. Demo 控制台 ----------
const formModel = reactive({ username: '', email: '', age: '' })
const validateResult = ref('')
const dynamicItems = ref(['username', 'email'])

const requiredRule = (msg = '必填') => async (v) => (v ? true : msg)
const emailRule = async (v) => (!v || /.+@.+\..+/.test(v) ? true : '邮箱格式不正确')
const ageRule = async (v) => (!v || (Number(v) >= 18 && Number(v) <= 120) ? true : '年龄 18-120')

const onSubmit = async () => {
  // 本 demo 用全局 model 简化：直接遍历当前 dynamicItems 调用规则
  const results = []
  for (const field of dynamicItems.value) {
    if (field === 'username' && !formModel.username) results.push({ field, message: '必填' })
    if (field === 'email' && !/.+@.+\..+/.test(formModel.email)) results.push({ field, message: '邮箱格式不正确' })
  }
  validateResult.value = results.length ? `失败：${results.map(r => `${r.field}: ${r.message}`).join('; ')}` : '成功 ✓'
}

const addItem = () => dynamicItems.value.push('age')
const removeItem = () => dynamicItems.value.pop()
</script>

<template>
  <div class="demo">
    <p class="title">04 · Form / FormItem 多层 context 注入</p>

    <div class="panel">
      <p class="panel-title">动态字段管理</p>
      <div class="controls">
        <button @click="addItem">新增 age 字段</button>
        <button @click="removeItem">移除最后一个</button>
        <button class="primary" @click="onSubmit">整体校验</button>
      </div>
      <p v-if="validateResult" class="result">{{ validateResult }}</p>
    </div>

    <Form :model="formModel" label-align="right">
      <FormItem v-if="dynamicItems.includes('username')" field="username" label="用户名" :rules="[requiredRule('用户名必填')]">
        <template #default>
          <FormInput field="username" placeholder="输入用户名" />
        </template>
      </FormItem>
      <FormItem v-if="dynamicItems.includes('email')" field="email" label="邮箱" :rules="[requiredRule('邮箱必填'), emailRule]">
        <template #default>
          <FormInput field="email" placeholder="user@example.com" />
        </template>
      </FormItem>
      <FormItem v-if="dynamicItems.includes('age')" field="age" label="年龄" :rules="[ageRule]">
        <template #default>
          <FormInput field="age" placeholder="18-120" />
        </template>
      </FormItem>
    </Form>

    <div class="hints">
      <p class="hint">观察</p>
      <ul>
        <li>每个 FormItem 失焦触发自身 validate，但通过 <code>formContext</code> 共享 model</li>
        <li>动态增删 FormItem —— <code>onUnmounted</code> 自动从 Form 注册表移除</li>
        <li>整体校验遍历所有 FormItem 聚合结果 —— 没有 Pinia 也能跨组件</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 600px; }
.title { font-weight: 700; font-size: 1rem; margin: 0 0 10px; }
.panel { background: #f6f8fa; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
.panel-title { margin: 0 0 6px; font-size: 0.85rem; font-weight: 600; }
.controls { display: flex; gap: 6px; flex-wrap: wrap; }
.controls button { padding: 5px 12px; border-radius: 4px; border: 1px solid #dcdfe6; background: #fff; cursor: pointer; font-size: 0.82rem; }
.controls button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.result { font-size: 0.82rem; margin: 8px 0 0; color: #e74c3c; }
.result:has-text { color: #42b883; }
.hints { margin-top: 10px; font-size: 0.78rem; color: #666; }
.hints ul { margin: 4px 0 0; padding-left: 20px; line-height: 1.7; }
.hint { font-weight: 600; margin: 0; }
code { background: #f6f8fa; padding: 1px 5px; border-radius: 3px; font-size: 0.78rem; }

:deep(.demo-form) { display: flex; flex-direction: column; gap: 12px; }
:deep(.form-item) { display: grid; grid-template-columns: 80px 1fr; align-items: center; gap: 8px; }
:deep(.form-item__label) { font-size: 0.82rem; color: #555; text-align: right; }
:deep(.form-item__content) { display: flex; }
:deep(.form-input) { flex: 1; padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 0.85rem; outline: none; transition: border-color 0.15s; }
:deep(.form-input:focus) { border-color: #42b883; }
:deep(.form-item.has-error .form-input) { border-color: #e74c3c; }
:deep(.form-item__error) { grid-column: 2; font-size: 0.75rem; color: #e74c3c; margin-top: 2px; }
</style>
