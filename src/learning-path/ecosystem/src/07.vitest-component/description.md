> 版本: Vitest 1.x+ | RFC: — | 状态: stable | 概念: Vitest 组件测试

# Vitest 组件测试

## 你会学到什么

Vue 组件测试 = `@vue/test-utils` 的 `mount()` + Vitest 的 `expect()`。核心三板斧：

1. **挂载**：`mount(Counter)` 返回 wrapper，wrapper 上挂载 DOM / 组件实例
2. **断言**：`expect(wrapper.text()).toContain(...)`
3. **交互**：`wrapper.find('button').trigger('click')`

## 最小用例

```ts
// Counter.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

describe('Counter', () => {
  it('renders initial count', () => {
    const wrapper = mount(Counter, { props: { initial: 5 } })
    expect(wrapper.text()).toContain('5')
  })

  it('increments on click', async () => {
    const wrapper = mount(Counter)
    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('1')
  })
})
```

## 常用 API

| API | 作用 |
|---|---|
| `mount(component, options)` | 完整挂载（子组件会真实渲染） |
| `shallowMount` | 浅挂载（子组件占位） |
| `wrapper.text()` | 提取可见文本 |
| `wrapper.html()` | 渲染 HTML |
| `wrapper.find(selector)` / `findComponent` | 查询元素 / 组件 |
| `wrapper.get(selector)` | 必中查询（找不到则抛错） |
| `wrapper.trigger(event)` | 派发 DOM 事件 |
| `wrapper.setValue(v)` | 设置 input 值（v-model 兼容） |
| `wrapper.setProps({ ... })` | 修改 props 触发响应 |
| `wrapper.vm.$nextTick()` | 等待 DOM 更新 |

## 动手试

右侧 REPL 模拟组件测试输出——左侧代码是测试，右侧 console 是断言结果。

> REPL 跑 Vitest 本身比较重，这里用 `console.log` 演示预期输出。真实项目在 `vitest run` 命令下执行。

## 测试组织建议

```
src/
├── components/
│   ├── Counter.vue
│   └── Counter.test.ts        # 伴随组件，单文件单测
├── composables/
│   ├── useCart.ts
│   └── useCart.test.ts
└── tests/
    └── integration/           # 集成测试
```

- **单元**：组件 + composables
- **集成**：router / store / i18n 真实跑
- **E2E**：Playwright / Cypress（见 10/11）

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vitest 官方](https://vitest.dev/) | API + 配置 |
| [@vue/test-utils v2](https://test-utils.vuejs.org/) | Vue 3 适配 |
| [Vue 测试指南](https://vuejs.org/guide/scaling-up/testing.html) | 官方推荐分层 |
