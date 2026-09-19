---
title: Testing    
tags: testing vitest playwright cypress      
birth: 2026-09-19      
modified: 2026-09-19      
---

Vue 测试分层
===

> 本节不重复 Vitest / Playwright / Cypress 各自的文档，而是实战视角：站在「什么场景用什么工具」的入口，把单元、组件、集成、E2E 四层关系一次性串清。配套的可交互 demo 见 [`/learning-path/ecosystem/`](/learning-path/ecosystem/)。

---

## 测试金字塔 vs 测试冰激凌

经典 **金字塔**：大量单元 → 一些集成 → 少量 E2E。优点是快、稳、易定位。

但 Vue / 现代前端出现 **冰激凌**：单元几乎全消失，靠 E2E 撑。原因：

1. UI 频繁变化，组件单测更新成本高
2. 现代组件逻辑很薄（数据从 store / composable 来，模板很瘦）
3. Vitest + jsdom 在很多边界上不如真实浏览器准

**实战推荐**：**单元 + 组件 + E2E 三层并重**，单测权重放在 composables / 工具函数上，组件测试做关键交互。

## 四层划分

| 层 | 工具 | 速度 | 覆盖面 | 适合 |
|---|---|---|---|---|
| 单元（reactivity / 工具） | Vitest | 极快 | 业务逻辑派生 | composables、store、utils |
| 组件（DOM 交互） | Vitest + @vue/test-utils 或 Cypress cy.mount | 快 | props / events / 渲染 | 关键交互组件 |
| 集成（路由 + 状态） | Vitest + Pinia + Router | 中 | 完整 Vue 上下文 | 页面级别 |
| E2E（用户视角） | Playwright / Cypress | 慢 | 真实浏览器 | 关键用户流程 |

## 选型决策树

```
代码改动只影响某个 ref/computed/watcher？
  └ 是 → 单元测试（Vitest + 假时钟）
  └ 否 ↓

挂载单个组件就能验证？
  └ 是 → 组件测试（Vitest + jsdom，或 Cypress cy.mount）
  └ 否 ↓

需要 router / store 协作？
  └ 是 → 集成测试（Vitest + 真实 plugin）
  └ 否 ↓

这是用户能感知的关键流程吗（登录 / 购买）？
  └ 是 → E2E（Playwright）
  └ 否 → 集成测试就够了
```

## Vitest 单元测试

```ts
// src/composables/useCart.test.ts
import { describe, it, expect } from 'vitest'
import { useCart } from './useCart'

describe('useCart', () => {
  it('sums prices', () => {
    const { items, total } = useCart()
    items.value = [{ price: 10 }, { price: 20 }]
    expect(total.value).toBe(30)
  })
})
```

不需要 `mount`，不需要 jsdom，最快。

### 假时钟

```ts
import { vi } from 'vitest'
import { useDebounceFn } from '@vueuse/core'

it('debounces', () => {
  vi.useFakeTimers()
  const fn = vi.fn()
  const debounced = useDebounceFn(fn, 300)
  debounced(1); debounced(2)
  vi.advanceTimersByTime(300)
  expect(fn).toHaveBeenCalledWith(2)
  vi.useRealTimers()
})
```

## Vitest + @vue/test-utils 组件测试

```ts
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

it('increments on click', async () => {
  const wrapper = mount(Counter)
  await wrapper.get('button').trigger('click')
  expect(wrapper.text()).toContain('Count: 1')
})
```

| API | 用途 |
|---|---|
| `mount(c, options)` | 完整挂载 |
| `shallowMount(c)` | 浅挂载（子组件占位） |
| `wrapper.find(selector)` | 找元素 |
| `wrapper.findComponent(Cmp)` | 找组件 |
| `wrapper.trigger(event)` | 派发 DOM 事件 |
| `wrapper.setValue(v)` | 设置 input 值（v-model 兼容） |
| `wrapper.setProps({...})` | 修改 props |

### 配套 Pinia

```ts
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => setActivePinia(createPinia()))
```

每个用例独立 store。

## Cypress cy.mount 组件测试

```ts
import Counter from './Counter.vue'

it('respects max prop', () => {
  cy.mount(Counter, { props: { max: 5 } })
  for (let i = 0; i < 10; i++) cy.get('button').click()
  cy.get('[data-test=count]').should('contain', '5')
})
```

跑在真实 Chromium / Firefox / WebKit 上，hover / focus / 键盘事件真实有效。

## Playwright E2E

```ts
import { test, expect } from '@playwright/test'

test('user can sign up', async ({ page }) => {
  await page.goto('/signup')
  await page.getByLabel('Email').fill('user@example.com')
  await page.getByLabel('Password').fill('correct-horse')
  await page.getByRole('button', { name: 'Sign up' }).click()
  await expect(page).toHaveURL('/welcome')
})
```

### 优选 `getByRole`

```ts
// 优
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email')
page.getByText(/Welcome/)

// 次选
page.locator('.btn-primary')

// 避免
page.locator('#submit-btn-v2')  // 业务变了就炸
```

### Trace viewer

```bash
npx playwright test --trace on
npx playwright show-trace test-results/.../trace.zip
```

GUI 时间旅行，每步操作的网络 / DOM 快照 / 控制台全保留。

## CI 流水线

```yaml
# .github/workflows/test.yml
- run: pnpm vitest run           # 单元 + 组件 + 集成
- run: pnpm playwright install
- run: pnpm playwright test      # E2E
```

| 阶段 | 触发 | 失败行为 |
|---|---|---|
| `vitest run` | 每次 push | block merge |
| `playwright test` | PR / main | block merge |
| Lighthouse | main merge | warning only |

## 测试代码本身的质量

- **不**测实现细节：组件的内部 `ref` 变量改名就炸的测试不可维护
- **测行为**：用户能感知的 props / events / DOM 输出
- **隔离**：每个用例前 `beforeEach(() => setActivePinia(createPinia()))`
- **可读**：`expect(wrapper.text()).toContain('Count: 1')` 比 `expect(wrapper.vm.count).toBe(1)` 更稳

## 常见坑

| 现象 | 原因 | 修复 |
|---|---|---|
| jsdom 不触发 IntersectionObserver | jsdom 没实现 | 改用 Cypress / 真实浏览器 |
| Vitest 跑组件白屏 | 没装 `@vue/test-utils` 或 jsdom | 装包 + `environment: 'jsdom'` |
| Playwright `getByRole` 找不到按钮 | `<button>` 缺可访问 name | 加 `aria-label` 或可见文字 |
| Cypress 找不到 `cy.mount` | 没装 `@cypress/vue` | 装包 |
| Pinia 单测串台 | 没 `setActivePinia` | `beforeEach` 里调 |

## 实战 demo 锚点

| 路径 | 演示 |
|---|---|
| [`/learning-path/ecosystem/#07.vitest-component`](/learning-path/ecosystem/#07.vitest-component) | Vitest 组件测试输出 |
| [`/learning-path/ecosystem/#08.vitest-reactivity`](/learning-path/ecosystem/#08.vitest-reactivity) | ref / computed / watch 单元测试 |
| [`/learning-path/ecosystem/#09.cypress-vue`](/learning-path/ecosystem/#09.cypress-vue) | cy.mount 模拟输出 |
| [`/learning-path/ecosystem/#10.playwright-vue`](/learning-path/ecosystem/#10.playwright-vue) | Playwright 命令与 trace |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方测试指南](https://vuejs.org/guide/scaling-up/testing.html) | 推荐分层 |
| [Vitest](https://vitest.dev/) | 单元 / 组件 |
| [@vue/test-utils](https://test-utils.vuejs.org/) | 组件 API |
| [Playwright](https://playwright.dev/) | E2E + 调试 |
| [Cypress](https://docs.cypress.io/) | 组件 + E2E |
