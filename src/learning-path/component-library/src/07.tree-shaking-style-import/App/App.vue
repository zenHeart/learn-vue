<script setup>
import { ref, defineComponent } from 'vue'

// ---------- 1. 伪组件库：5 个组件 + 独立样式 ----------
// 演示场景：每个组件有独立 CSS，演示按需 vs 全量
const AcmeButton = defineComponent({
  name: 'AcmeButton',
  props: { variant: { type: String, default: 'primary' } },
  setup(props, { slots }) {
    return () => h('button', { class: ['acme-btn', `acme-btn--${props.variant}`] }, slots.default?.())
  },
})
const AcmeInput = defineComponent({
  name: 'AcmeInput',
  setup() { return () => h('input', { class: 'acme-input', placeholder: '按需引入的 Input' }) },
})
const AcmeCard = defineComponent({
  name: 'AcmeCard',
  setup(_, { slots }) {
    return () => h('div', { class: 'acme-card' }, slots.default?.())
  },
})
const AcmeBadge = defineComponent({
  name: 'AcmeBadge',
  props: { color: { type: String, default: 'red' } },
  setup(props, { slots }) {
    return () => h('span', { class: ['acme-badge', `acme-badge--${props.color}`] }, slots.default?.())
  },
})
const AcmeModal = defineComponent({
  name: 'AcmeModal',
  setup(_, { slots }) {
    return () => h('div', { class: 'acme-modal-mock' }, slots.default?.())
  },
})

// ---------- 2. 模式：完整 vs 按需 vs CSS Modules ----------
const importStrategy = ref('full')
const activeComponent = ref('button')   // 模拟用户只引入了一个

// ---------- 3. CSS Modules 演示 ----------
const cssModulesStyles = {
  scopedButton: 'cm_a3f2',  // 模拟 hash 化类名
  scopedInput:  'cm_b1e4',
}

const isInBundle = (component) => {
  if (importStrategy.value === 'full') return true
  if (importStrategy.value === 'on-demand') return component === activeComponent.value
  return false
}
</script>

<template>
  <div class="demo">
    <p class="title">07 · 按需引入样式（Tree-shaking）</p>

    <div class="panel">
      <p class="panel-title">引入策略</p>
      <div class="controls">
        <button :class="{ active: importStrategy === 'full' }" @click="importStrategy = 'full'">完整引入</button>
        <button :class="{ active: importStrategy === 'on-demand' }" @click="importStrategy = 'on-demand'">按需引入</button>
        <button :class="{ active: importStrategy === 'css-modules' }" @click="importStrategy = 'css-modules'">CSS Modules</button>
      </div>
      <p v-if="importStrategy === 'on-demand'" class="meta">仅引入：<code>{{ activeComponent }}</code>（其它不打包）</p>
      <p v-else-if="importStrategy === 'full'" class="meta">所有 5 个组件 CSS 全部打包</p>
      <p v-else class="meta">类名带 hash，全局隔离</p>
    </div>

    <!-- 模拟不同策略下的样式注入 -->
    <style v-if="importStrategy === 'full'">
      /* 完整引入：所有 5 个组件样式都进 bundle */
      .acme-btn { padding: 8px 16px; border-radius: 4px; border: 1px solid #dcdfe6; background: #fff; cursor: pointer; }
      .acme-btn--primary { background: #409eff; color: #fff; border-color: #409eff; }
      .acme-btn--danger  { background: #f56c6c; color: #fff; border-color: #f56c6c; }
      .acme-input { padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px; width: 100%; box-sizing: border-box; }
      .acme-card { padding: 12px; border: 1px solid #ebeef5; border-radius: 6px; background: #fafbfc; }
      .acme-badge { padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; }
      .acme-badge--red { background: #fef0f0; color: #f56c6c; }
      .acme-badge--green { background: #f0f9eb; color: #67c23a; }
      .acme-modal-mock { padding: 16px; background: rgba(0,0,0,0.5); color: #fff; border-radius: 6px; }
    </style>
    <style v-else-if="importStrategy === 'on-demand' && activeComponent === 'button'">
      /* 按需引入：仅打包 Button.css */
      .acme-btn { padding: 8px 16px; border-radius: 4px; border: 1px solid #dcdfe6; background: #fff; cursor: pointer; }
      .acme-btn--primary { background: #409eff; color: #fff; border-color: #409eff; }
      .acme-btn--danger { background: #f56c6c; color: #fff; border-color: #f56c6c; }
    </style>
    <style v-else-if="importStrategy === 'on-demand' && activeComponent === 'input'">
      /* 按需引入：仅打包 Input.css */
      .acme-input { padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px; width: 100%; box-sizing: border-box; }
    </style>

    <p v-if="importStrategy === 'on-demand'" class="hint-text">
      点下方按钮可切换「用户当前引入的组件」 —— 模拟 unplugin 扫描到的组件
    </p>
    <div v-if="importStrategy === 'on-demand'" class="component-tabs">
      <button v-for="c in ['button', 'input', 'card', 'badge', 'modal']" :key="c" :class="{ active: activeComponent === c }" @click="activeComponent = c">
        {{ c }}
      </button>
    </div>

    <!-- 组件演示 -->
    <div class="rendered-area">
      <p class="area-label">实际渲染结果：</p>
      <div class="rendered">
        <AcmeButton v-if="isInBundle('button')">Primary</AcmeButton>
        <AcmeButton v-if="isInBundle('button')" variant="danger">Danger</AcmeButton>
        <AcmeInput v-if="isInBundle('input')" />
        <AcmeCard v-if="isInBundle('card')">Card 内容</AcmeCard>
        <div v-if="isInBundle('badge')" style="display: flex; gap: 4px;">
          <AcmeBadge color="red">Red</AcmeBadge>
          <AcmeBadge color="green">Green</AcmeBadge>
        </div>
        <AcmeModal v-if="isInBundle('modal')">Modal Mock</AcmeModal>
        <p v-if="!isInBundle('button') && !isInBundle('input') && !isInBundle('card') && !isInBundle('badge') && !isInBundle('modal')" class="empty">
          （按需模式下，未引入的组件未渲染）
        </p>
      </div>
    </div>

    <!-- CSS Modules 演示 -->
    <div v-if="importStrategy === 'css-modules'" class="cm-demo">
      <p class="area-label">CSS Modules —— 类名 hash 化：</p>
      <div class="cm-grid">
        <div class="cm-block">
          <p class="cm-title">组件 A 内的类名</p>
          <code class="cm-class">.{{ cssModulesStyles.scopedButton }}</code>
          <button :class="cssModulesStyles.scopedButton">A 的按钮</button>
        </div>
        <div class="cm-block">
          <p class="cm-title">组件 B 内的类名</p>
          <code class="cm-class">.{{ cssModulesStyles.scopedInput }}</code>
          <input :class="cssModulesStyles.scopedInput" placeholder="B 的输入框" />
        </div>
      </div>
      <p class="cm-hint">两个组件都有 <code>.button</code> 类名 —— 但因 hash 不同，实际不会冲突</p>
    </div>

    <!-- 打包体积对比表 -->
    <div class="bundle-table">
      <p class="area-label">打包体积对比（mock 数据）</p>
      <table>
        <thead>
          <tr><th>策略</th><th>CSS 体积</th><th>JS 体积</th><th>总</th></tr>
        </thead>
        <tbody>
          <tr><td>完整引入</td><td>15.4 KB</td><td>132 KB</td><td>147 KB</td></tr>
          <tr><td>按需（仅 Button）</td><td>1.8 KB</td><td>11 KB</td><td>12.8 KB</td></tr>
          <tr><td>按需（Button + Input）</td><td>3.6 KB</td><td>22 KB</td><td>25.6 KB</td></tr>
          <tr><td>CSS Modules</td><td>~同上</td><td>~同上</td><td>+ hash 开销</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 640px; }
.title { font-weight: 700; font-size: 1rem; margin: 0 0 10px; }
.panel { background: #f6f8fa; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
.panel-title { margin: 0 0 8px; font-size: 0.85rem; font-weight: 600; }
.controls, .component-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.controls button, .component-tabs button { padding: 5px 10px; border-radius: 4px; border: 1px solid #dcdfe6; background: #fff; cursor: pointer; font-size: 0.78rem; }
.controls button.active, .component-tabs button.active { background: #42b883; color: #fff; border-color: #42b883; }
.meta, .hint-text { font-size: 0.78rem; margin: 0; color: #666; }
.rendered-area, .cm-demo, .bundle-table { margin-top: 10px; background: #fff; border: 1px solid #e4e7ed; border-radius: 8px; padding: 10px 12px; }
.area-label { font-size: 0.82rem; font-weight: 600; margin: 0 0 8px; }
.rendered { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.rendered .empty { color: #999; font-style: italic; margin: 0; }
.cm-demo { background: #f9fafb; }
.cm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
.cm-block { padding: 10px; background: #fff; border: 1px solid #e4e7ed; border-radius: 6px; }
.cm-title { margin: 0 0 4px; font-size: 0.78rem; color: #555; }
.cm-class { display: inline-block; font-size: 0.76rem; padding: 1px 6px; background: #fef3c7; border-radius: 3px; margin-bottom: 6px; }
.cm-hint { font-size: 0.76rem; color: #666; margin: 0; }
.cm_a3f2 { padding: 8px 14px; background: #42b883; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.cm_b1e4 { padding: 6px 10px; border: 1px solid #42b883; border-radius: 4px; background: #fff; color: #42b883; width: 100%; box-sizing: border-box; }
.bundle-table table { width: 100%; border-collapse: collapse; font-size: 0.76rem; }
.bundle-table th, .bundle-table td { padding: 5px 10px; border-bottom: 1px solid #ebeef5; text-align: left; }
.bundle-table th { background: #fafbfc; font-weight: 600; }
code { background: #f6f8fa; padding: 1px 5px; border-radius: 3px; font-size: 0.78rem; color: #5b21b6; }
</style>
