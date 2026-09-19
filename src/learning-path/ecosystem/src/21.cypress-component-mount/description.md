> **版本**：Cypress 12+ / @cypress/vue 5.x+ | **状态**：stable | **概念**：组件级浏览器内测试

# Cypress cy.mount 组件挂载

## 这是什么

Cypress 12+ 把组件测试作为一等公民：保留 E2E 的真实浏览器、原生 DOM API、自动等待、时间旅行调试，但跑在 `cy.mount(Comp, opts)` 上而非完整页面。和 `@vue/test-utils` 的 `mount` 类似，但运行在 Chromium/Firefox/WebKit 真内核里——焦点管理、`ResizeObserver`、`IntersectionObserver`、`getBoundingClientRect` 都是真实的。

`@cypress/vue` 是 Vue 适配层（`@cypress/react` 是 React 版）：负责把 SFC 编译、Vue app 实例化、挂到测试容器。

## 实战配置

```ts
// cypress.config.ts
import { defineConfig } from 'cypress'
import vue from '@cypress/vite-dev-server/dist/plugins/vue'

export default defineConfig({
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.{cy,spec}.{ts,tsx,js,jsx}',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
})
```

```ts
// Counter.cy.ts
import Counter from './Counter.vue'

describe('<Counter />', () => {
  it('renders initial value from prop', () => {
    cy.mount(Counter, { props: { initial: 3 } })
    cy.get('[data-test=count]').should('contain.text', '3')
  })

  it('increments on click and respects max', () => {
    cy.mount(Counter, { props: { initial: 0, max: 2 } })
    cy.get('button').click().click().click()
    cy.get('[data-test=count]').should('contain.text', '2')
  })

  it('renders default slot content', () => {
    cy.mount(Counter, {
      props: { initial: 1 },
      slots: { default: '<span class="badge">New</span>' },
    })
    cy.get('.badge').should('contain.text', 'New')
  })

  it('injects global plugin (i18n)', () => {
    cy.mount(Counter, {
      global: { plugins: [i18n] },   // 与 @vue/test-utils 一样的 global 选项
      props: { initial: 0 },
    })
    // i18n 行为可断言
  })
})
```

## mount 选项对照

| 选项 | 作用 |
|---|---|
| `props` | 组件 props |
| `slots` | 命名插槽（字符串、Component、render fn 都可） |
| `attrs` | 透传到根元素的 attribute |
| `global.plugins` | app.use(plugin) |
| `global.provide` | app.provide(key, value) |
| `global.components` | 全局注册组件 |
| `global.stubs` | 同 @vue/test-utils |

## 与 @vue/test-utils 的关键差异

| 维度 | `mount`（test-utils） | `cy.mount` |
|---|---|---|
| 浏览器 | jsdom | 真 Chromium |
| 异步断言 | `await nextTick()` | `cy.should(...)` 自动重试 |
| 调试 | 终端日志 + DOM 树 | 时间旅行 trace + 网络面板 |
| 跑速 | 快 5-20 倍 | 慢 |
| 适合 | 单测、TDD | 集成、复杂交互（焦点、拖拽） |

## 源码走读

```ts
// @cypress/vue/src/mount.ts（简化）
export function mount(component, options = {}) {
  const app = createApp(component, options.props)
  if (options.global?.plugins) options.global.plugins.forEach(p => app.use(p))
  app.mount(cy.mountContainer)  // Cypress 准备的容器 div
  return cy.wrap(app)            // 返回 Cypress chainable
}
```

跟 `createApp().mount()` 几乎一样，只是挂载点换成 Cypress 注入的容器、返回 Cypress 链式对象而非 VueWrapper。

## 常见踩坑

- **`cy.mount` 找不到组件**：检查 `cypress.config.ts` 的 `devServer.framework: 'vue'` 是否配置；Vue 3 + Vite 必须装 `@cypress/vite-dev-server`。
- **global.provide 类型丢失**：在 `cypress/support/component.ts` 里用 `declare global { interface Cypress { ... } }` 扩展类型。
- **slot 类型**：HTML 字符串 slot 会被 Vue compiler 处理；JSX/Component slot 直接传 component instance。
- **trace viewer 体积**：CI 默认不开 trace，本地用 `cypress run --record --key ...` 或 `cypress open`。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Cypress 组件测试](https://docs.cypress.io/guides/component-testing/introduction) | 选型与运行 |
| [@cypress/vue 仓库](https://github.com/cypress-io/cypress/tree/develop/npm/vue) | API |
| [相关 demo](./) | 09.cypress-vue 是 E2E + 组件测试对比 |
