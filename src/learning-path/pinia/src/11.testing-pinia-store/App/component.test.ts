// 组件级测试样例（vitest + @vue/test-utils）
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { useTodosStore } from './store'

const Counter = defineComponent({
  setup() {
    const store = useTodosStore()
    function inc() { store.add('由组件触发') }
    return () => h('button', { onClick: inc }, `count=${store.items.length}`)
  },
})

describe('todos component', () => {
  it('responds to user click', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(Counter)
    expect(wrapper.text()).toBe('count=0')
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toBe('count=1')
  })
})