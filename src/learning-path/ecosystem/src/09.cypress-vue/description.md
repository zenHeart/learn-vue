> 版本: Cypress 12.x+ | RFC: — | 状态: stable | 概念: Cypress 端到端测试

# Cypress + Vue 组件测试

## 你会学到什么

Cypress 12+ 提供 `cy.mount()` 用来做组件级测试，比 E2E 快，但仍能在真实浏览器里跑。比 Vitest 组件测试更接近用户视角（真实的 DOM API、键盘事件、焦点管理）。

## 最小用例

```ts
// Counter.cy.ts
import Counter from './Counter.vue'

describe('<Counter />', () => {
  it('renders and increments', () => {
    cy.mount(Counter, { props: { initial: 3 } })
    cy.get('[data-test=count]').should('contain', '3')
    cy.get('button').click()
    cy.get('[data-test=count]').should('contain', '4')
  })

  it('respects max prop', () => {
    cy.mount(Counter, { props: { max: 5 } })
    for (let i = 0; i < 10; i++) cy.get('button').click()
    cy.get('[data-test=count]').should('contain', '5')
  })
})
```

## Vitest 组件测试 vs Cypress 组件测试

| 维度 | Vitest + @vue/test-utils | Cypress cy.mount |
|---|---|---|
| 浏览器 | jsdom | 真实 Chromium / Firefox / WebKit |
| 速度 | 快（10-100 倍） | 慢 |
| 真实 DOM API | 模拟 | 原生 |
| 调试 | 终端日志 | GUI 时间旅行 + trace |
| 适合场景 | 单测、TDD | 集成、复杂交互 |

## 推荐分层

- **底层逻辑**（reactive、纯函数） → Vitest
- **组件交互**（hover、focus、键盘） → Cypress cy.mount
- **端到端流程**（登录、购买） → Cypress E2E

## 动手试

右侧 REPL 模拟 Cypress 跑 `cy.mount(Counter)` 的命令 + 输出。

## 常见坑

| 现象 | 原因 | 修复 |
|---|---|---|
| `cy.mount` 找不到组件 | 没装 `@cypress/vue` | 装包 + 在 `cypress.config` 注册 |
| 时不时白屏 | Vue 版本不匹配 | 看 `@cypress/vue` 兼容矩阵 |
| 焦点不工作 | jsdom vs 真实浏览器差异 | 用 Cypress 而不是 Vitest |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [@cypress/vue](https://github.com/cypress-io/cypress/tree/develop/npm/vue) | 仓库 |
| [Mount API](https://docs.cypress.io/api/commands/mount) | 命令参考 |
| [Cypress 组件测试 vs E2E](https://docs.cypress.io/guides/component-testing/introduction) | 选型 |
