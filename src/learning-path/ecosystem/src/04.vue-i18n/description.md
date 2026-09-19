> 版本: vue-i18n 9.x+ | RFC: — | 状态: stable | 概念: vue-i18n 国际化

# Vue I18n 实战

## 你会学到什么

`vue-i18n@9` 是 Vue 3 的官方国际化库。本节聚焦 **Composition API 风格**：`createI18n()` 创建实例、`useI18n()` 在 setup 中读取、`<i18n-t>` 组件式使用、以及**懒加载语言包**的最佳实践。

## 最小可用

```ts
// i18n.ts
import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  legacy: false,        // Composition API 风格
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': { hello: '你好，{name}' },
    en: { hello: 'Hello, {name}' }
  }
})
```

```vue
<script setup>
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
</script>

<template>
  <p>{{ t('hello', { name: 'Vue' }) }}</p>
  <button @click="locale = 'en'">Switch</button>
</template>
```

## 关键 API

| API | 用途 |
|---|---|
| `useI18n()` | setup 中拿到 `t` / `locale` / `d` / `n` |
| `t('key', values)` | 翻译 + 插值 |
| `<i18n-t keypath="key">` | 组件式翻译，支持富文本插槽 |
| `d(date, format)` | 日期格式化 |
| `n(number, format)` | 数字（含货币）格式化 |

## 复数

```json
{ "car": "{count} car | {count} cars" }
```

`t('car', 1)` → "1 car"，`t('car', 5)` → "5 cars"。可以用 `t('car', 0, { named: { count: 0 } })`。

## 懒加载语言包

把语言包按需加载能显著降低首屏体积。常见做法：

```ts
// 同步加载
const messages = { 'zh-CN': zhCN, en }

// 动态加载
async function loadLocale(locale: string) {
  const mod = await import(`./locales/${locale}.json`)
  i18n.global.setLocaleMessage(locale, mod.default)
  i18n.global.locale.value = locale
}
```

## 动手试

右侧 REPL 演示：

- `useI18n().t` 切换 zh / en
- 复数表达 `car | cars`
- 占位符 `{name}` 插值

## SSR 注意

VitePress / Nuxt 集成 vue-i18n 时，要在**客户端 hydration 前**就准备好语言包，否则首屏会出现闪烁。建议在 `app.use(i18n)` 之后立即 `await loadLocale(router.currentRoute.value.meta.locale)`。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [vue-i18n 官方](https://vue-i18n.intlify.dev/) | API 文档 |
| [Composition API 模式](https://vue-i18n.intlify.dev/guide/advanced/composition.html) | legacy: false |
| [VitePress i18n](https://vitepress.dev/guide/i18n) | 站点级多语言 |
