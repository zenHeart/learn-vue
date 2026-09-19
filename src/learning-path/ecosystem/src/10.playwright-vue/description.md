> 版本: Playwright 1.x+ | RFC: — | 状态: stable | 概念: Playwright 端到端测试

# Playwright 端到端测试

## 你会学到什么

`@playwright/test` 是 Microsoft 出品的 E2E 框架：跨 Chromium / Firefox / WebKit、零配置 trace viewer、原生支持 auto-wait 与 `getByRole` 语义化查询。在 Vue 项目里写 E2E 测试，建议**用语义查询而不是 CSS class**——class 会变，role 不会。

## 最小用例

```ts
// e2e/counter.spec.ts
import { test, expect } from '@playwright/test'

test('counter increments', async ({ page }) => {
  await page.goto('/counter')
  await expect(page.getByRole('button', { name: '+' })).toBeVisible()
  await page.getByRole('button', { name: '+' }).click()
  await expect(page.getByText('Count: 1')).toBeVisible()
})
```

## 关键 API

| API | 用途 |
|---|---|
| `page.goto(url)` | 导航 |
| `page.getByRole(role, { name })` | 首选查询（语义） |
| `page.getByLabel(text)` | 表单 label 关联 |
| `page.getByPlaceholder(text)` | 占位符 |
| `page.locator(selector)` | CSS / XPath（次选） |
| `expect(locator).toBeVisible()` | 内置 auto-wait |
| `test.describe` / `test.beforeEach` | 分组与钩子 |

## 调试 trace viewer

```bash
npx playwright test --trace on
npx playwright show-trace test-results/.../trace.zip
```

trace viewer 能让你**时间旅行**每一步操作：网络、DOM 快照、控制台、截图。

## 动手试

右侧 REPL 演示一个 Playwright 跑测试的命令 + 输出。

## vs Cypress

| 维度 | Playwright | Cypress |
|---|---|---|
| 跨浏览器 | 3 大内核原生 | 主要 Chromium |
| 多标签 / iframe | 原生支持 | 需要插件 |
| 速度 | 快 | 中等 |
| 测试隔离 | 浏览器上下文（轻量） | iframe |
| TypeScript | 一等公民 | 一等公民 |
| 学习曲线 | 中等 | 平缓 |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Playwright 官方](https://playwright.dev/) | 文档 |
| [Locators 优先级](https://playwright.dev/docs/locators) | 何时用哪种查询 |
| [Trace Viewer](https://playwright.dev/docs/trace-viewer) | 调试神器 |
