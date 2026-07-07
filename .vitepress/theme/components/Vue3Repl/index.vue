<script setup lang="ts">
import { Repl, useStore, useVueImportMap } from '@vue/repl'
import CodeMirror from '@vue/repl/codemirror-editor'
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import {
  onHashChange
} from './utils'
import {
  VTFlyout,
  VTIconChevronLeft,
  VTIconChevronRight,
  VTLink
} from '@vue/theme'

// 接受路径参数和数据
const props = defineProps<{
  path: string
  data: Record<string, any>
}>()

// 使用提供的数据
const data = computed(() => {
  console.log('Learning path data:', props.data)
  return props.data || {}
})

const { vueVersion, defaultVersion, importMap } = useVueImportMap({
  runtimeDev: () =>
    `https://unpkg.com/vue@${
      vueVersion.value || defaultVersion
    }/dist/vue.esm-browser.js`
})
const store = useStore({
  builtinImportMap: importMap
})

const instruction = ref<HTMLElement>()

const currentStep = ref('')
const keys = computed(() => {
  return Object.keys(data.value).sort((a, b) => {
    // 使用自然排序，支持 "01.watch" 这样的格式
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  })
})

const totalSteps = computed(() => keys.value.length)

const titleRE = /<h1.*?>(.+?)<a class="header-anchor/
const allSteps = computed(() => {
  return keys.value.map((key, i) => {
    const desc = data.value[key]['description.md'] as string
    const match = desc?.match?.(titleRE)
    const title = match ? match[1] : `步骤 ${i + 1}`
    return {
      text: `${i + 1}. ${title}`,
      link: `#${key}`
    }
  })
})

const currentDescription = computed(() => {
  return data.value[currentStep.value]?.['description.md']
})

const currentStepIndex = computed(() => {
  return keys.value.indexOf(currentStep.value) + 1
})

const prevStep = computed(() => {
  const index = keys.value.indexOf(currentStep.value)
  if (index > 0) {
    return keys.value[index - 1]
  }
  return null
})

const nextStep = computed(() => {
  const index = keys.value.indexOf(currentStep.value)
  if (index < keys.value.length - 1) {
    return keys.value[index + 1]
  }
  return null
})

const showingHint = ref(false)

function getMainFil(content: any) {
  const metaInfo = content['_meta.js'] || {}
  const filesLength = Object.keys(content.App).length
  return metaInfo.mainFile || (filesLength > 1 ? 'App.vue' : Object.keys(content.App)[0])
}


function updateExample(scroll = false) {
  if (Object.keys(data.value).length === 0) {
    console.warn('No data loaded for path:', props.path)
    return // 等待数据加载
  }
  
  let hash = location.hash.slice(1)
  if (!hash || !data.value.hasOwnProperty(hash)) {
    hash = keys.value[0]
    console.log('Setting initial hash to:', hash)
    // 使用 replaceState 而不是 location.replace 来避免整页刷新
    if (window.history.replaceState) {
      window.history.replaceState(null, '', `#${hash}`)
    } else {
      location.hash = `#${hash}`
    }
  }
  currentStep.value = hash
  console.log('Current step:', currentStep.value)

  try {
    const content = showingHint.value ? data.value[hash]._hint! : data.value[hash]
    store.setFiles(content.App, getMainFil(content))
  } catch (e) {
    console.error('Error setting files:', e)
  }

  if (scroll) {
    nextTick(() => {
      instruction.value!.scrollTop = 0
    })
  }
}

function setVariant(variant: 'default' | 'hint') {
  showingHint.value = variant === 'hint'
  updateExample()
  syncVariantButtons()
}

function toggleResult() {
  showingHint.value = !showingHint.value
  updateExample()
}

function syncVariantButtons() {
  nextTick(() => {
    const root = instruction.value
    if (!root) return
    root.querySelectorAll<HTMLButtonElement>('[data-lp-variant]').forEach((btn) => {
      const variant = btn.dataset.lpVariant as 'default' | 'hint'
      const active =
        variant === 'hint' ? showingHint.value : !showingHint.value
      btn.classList.toggle('active', active)
      btn.onclick = () => setVariant(variant)
    })
  })
}

watch([currentDescription, showingHint], syncVariantButtons)
onMounted(syncVariantButtons)

// 初始化
onHashChange(() => {
  showingHint.value = false
  updateExample(true)
})

// 组件挂载后立即更新示例
updateExample()
</script>

<template>
  <section class="learning-path">
    <article class="instruction" ref="instruction">
      <VTFlyout :button="`${currentStepIndex} / ${totalSteps}`" v-if="totalSteps">
        <VTLink
          v-for="(step, i) of allSteps"
          class="vt-menu-link"
          :class="{ active: i + 1 === currentStepIndex }"
          :href="step.link"
          >{{ step.text }}</VTLink
        >
      </VTFlyout>
      <div class="vt-doc" v-html="currentDescription"></div>
      <div
        class="hint"
        v-if="data[currentStep]?._hint && !currentDescription?.includes('lp-variants')"
      >
        <button @click="toggleResult">
          {{ showingHint ? '重置' : '显示提示!' }}
        </button>
      </div>
      <footer>
        <a v-if="prevStep" :href="`#${prevStep}`"
          ><VTIconChevronLeft class="vt-link-icon" style="margin: 0" />
          上一步</a
        >
        <a class="next-step" v-if="nextStep" :href="`#${nextStep}`"
          >下一步 <VTIconChevronRight class="vt-link-icon"
        /></a>
      </footer>
    </article>
    <Repl
      layout="vertical"
      :editor="CodeMirror"
      :store="store"
      :showCompileOutput="false"
      :clearConsole="false"
      :showImportMap="false"
      @keyup="showingHint = false"
    />
  </section>
</template>

<style scoped>
.learning-path {
  display: flex;
  max-width: 1440px;
  margin: 0 auto;
  --height: calc(
    100vh - var(--vt-nav-height) - var(--vt-banner-height, 0px)
  );
}

.preference-switch {
  position: relative;
}

.instruction {
  width: 45%;
  height: var(--height);
  padding: 0 32px 24px;
  border-right: 1px solid var(--vt-c-divider-light);
  font-size: 15px;
  overflow-y: auto;
  position: relative;
  --vt-nav-height: 40px;
}

.vue-repl {
  width: 55%;
  height: var(--height);
}

.vt-flyout {
  position: sticky;
  top: 0;
  float: right;
  background: var(--vt-c-bg);
}

.vt-menu-link.active {
  font-weight: 500;
  color: var(--vt-c-brand);
}

footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--vt-c-divider);
  margin-top: 1.5em;
  padding-top: 1em;
}

footer a {
  font-weight: 500;
  color: var(--vt-c-brand);
}

.next-step {
  margin-left: auto;
}

.vt-doc :deep(h1) {
  font-size: 1.4em;
  margin: 1em 0;
}

.vt-doc :deep(h2) {
  font-size: 1.1em;
  margin: 1.2em 0 0.5em;
  padding: 0;
  border-top: none;
}

.vt-doc :deep(.header-anchor) {
  display: none;
}

.vt-doc :deep(summary) {
  cursor: pointer;
}

.vt-doc :deep(.lp-variants) {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0.8em 0 1em;
}

.vt-doc :deep(.lp-variant) {
  background: var(--vt-c-bg-soft);
  color: var(--vt-c-text-1);
  border: 1px solid var(--vt-c-divider);
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.vt-doc :deep(.lp-variant:hover) {
  border-color: var(--vt-c-brand);
}

.vt-doc :deep(.lp-variant.active) {
  background: var(--vt-c-brand);
  color: var(--vt-c-bg);
  border-color: var(--vt-c-brand);
}

.hint {
  padding-top: 1em;
}

button {
  background-color: var(--vt-c-brand);
  color: var(--vt-c-bg);
  padding: 4px 12px 3px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}


@media (max-width: 720px) {
  .learning-path {
    display: block;
  }
  .instruction {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--vt-c-divider-light);
    height: 30vh;
    padding: 0 24px 24px;
  }
  .vue-repl {
    width: 100%;
    height: calc(
      70vh - var(--vt-nav-height) - var(--vt-banner-height, 0px)
    );
  }
  :deep(.wide) {
    display: none;
  }
  :deep(.narrow) {
    display: inline;
  }
}
</style>
