import type { Directive } from 'vue'

/**
 * 一个全生命周期的指令示例：演示 7 个钩子的执行顺序
 */
export const lifecycleLog: Directive<HTMLElement, string> = {
  created(el, binding) {
    el.dataset.lifecycleCreated = '1'
    console.log('[dir] created', binding.value)
  },
  beforeMount(el) {
    el.dataset.lifecycleBeforeMount = '1'
    console.log('[dir] beforeMount')
  },
  mounted(el) {
    el.dataset.lifecycleMounted = '1'
    console.log('[dir] mounted')
  },
  beforeUpdate(el, binding) {
    console.log('[dir] beforeUpdate value =', binding.value)
  },
  updated(el, binding) {
    el.dataset.lastValue = binding.value
    console.log('[dir] updated')
  },
  beforeUnmount(el) {
    console.log('[dir] beforeUnmount')
  },
  unmounted(el) {
    console.log('[dir] unmounted')
  },
}

/**
 * 自动聚焦的指令
 */
export const focus: Directive<HTMLElement> = {
  mounted(el) {
    el.focus()
  },
}

/**
 * 防抖点击指令
 */
export const debounceClick: Directive<HTMLElement, number> = {
  mounted(el, binding) {
    let timer: number | null = null
    const handler = () => {
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        binding.value && binding.value
        // 调用 binding.arg / binding.modifiers 也可
      }, 200)
    }
    el.addEventListener('click', handler)
    ;(el as HTMLElement & { __cleanup?: () => void }).__cleanup = () => {
      el.removeEventListener('click', handler)
    }
  },
  unmounted(el) {
    ;(el as HTMLElement & { __cleanup?: () => void }).__cleanup?.()
  },
}
