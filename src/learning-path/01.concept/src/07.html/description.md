> 版本: Vue 3.0+ | RFC: — | 状态: stable | 概念: v-html 指令 / XSS

# v-html 与文本插值的安全对比

`v-html` 把字符串作为 HTML 直接插入 DOM，等价于原生 `innerHTML`。它会绕过 Vue 的模板编译与响应式更新，适用于可信的富文本片段；其他场景必须使用文本插值 `{{ }}`。

## 你会学到什么

- 文本插值自动 HTML 转义，避免 XSS。
- `v-html` 直接写入 DOM，不做转义，只用于可信内容。
- CSP 策略下应避免 `v-html`，改用静态模板或第三方 sanitizer。

## 动手试

1. 在输入框粘贴 `<script>alert(1)</script>`，观察文本插值与 v-html 的差异。
2. 打开 DevTools Network，确认页面并未加载外部脚本。
3. 替换为 `<img src=x onerror=alert(1)>`，体会 XSS 风险。

## 关键陷阱

- 永远不要把用户输入直接喂给 `v-html`。
- 即便业务可信，也要考虑 CSP 与样式注入。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 - v-html](https://vuejs.org/api/built-in-directives.html#v-html) | API 文档 |
| [OWASP XSS Filter Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) | XSS 防护策略 |