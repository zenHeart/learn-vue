> **版本**：vue-i18n 9.x+ | **状态**：stable | **概念**：复数与时间格式化

# vue-i18n 复数 + 日期时间格式化 + fallback 链

## 这是什么

`vue-i18n` 不止 `t()`：复数规则（pluralization）走 ICU MessageFormat，日期/数字走 `Intl` API。还有 fallback 链——当某个 key 在当前 locale 找不到时回退到 fallback locale。本节把 04.vue-i18n 没展开的部分讲透。

## 实战配置

```ts
// i18n.ts
import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: ['en', 'zh-TW'],   // fallback 链：先 en 后 zh-TW
  pluralRules: {
    // 自定义复数规则（默认走 Intl.PluralRules）
    'zh-CN': (choice, choicesLength) => {
      // 中文无复数变化，永远走 =0（其他）或 1（单数）分支
      return choicesLength === 1 ? 0 : 1
    },
  },
  messages: {
    'zh-CN': {
      cart: '购物车 | {count} 件商品',     // pipe 语法：单数 | 复数
      apple: '没有苹果 | 1 个苹果 | {count} 个苹果',  // 零 | 单 | 多
      lastSeen: '上次登录：{date}',          // 时间占位符
    },
    en: {
      cart: '{count} item |||| {count} items',     // 4 pipe 分隔 5 个分支
      apple: 'no apples | 1 apple | {count} apples',
      lastSeen: 'Last seen: {date}',
    },
  },
  datetimeFormats: {
    'zh-CN': {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' },
    },
    en: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' },
    },
  },
})
```

## API 速查

```ts
const { t, d, n, tm, rt } = useI18n()

// 复数：第二个参数传数字
t('cart', count)              // '购物车 | {count} 件商品' → '5 件商品'
t('apple', count)             // 'no apples | 1 apple | {count} apples'

// 具名参数
t('cart', count, { named: { count } })

// 日期
d(new Date(), 'short')        // '2026年9月19日'
d(new Date(), 'long', 'en')   // 'Friday, September 19, 2026 at 03:42 PM'

// 数字
n(1234.5, 'currency', { currency: 'USD' })   // '$1,234.50'

// tm / rt：消息函数（运行时生成键）
const msg = tm('errors.required')
const text = rt(msg, { field: 'email' })
```

## fallback 链的行为

```text
key: 'cart' 在 'zh-CN' 不存在，在 'en' 存在
locale = 'zh-CN' → fallbackLocale = ['en', 'zh-TW']
  1. 查 zh-CN → undefined
  2. 查 en → 'cart' 命中 ✓
  3. 用 en 的字符串 + zh-CN 的数字格式（数字 locale 不 fallback）
```

Vue I18n 在 fallback 时**保留原 locale 的格式化器**——避免日期格式因 fallback 而变样。

## pluralRules 的边界

| Locale | 复数分支 |
|---|---|
| 中文 / 日文 / 韩文 | 无复数变化，`choicesLength === 1` 走 0，其他走 1 |
| 英文 | 2 个：`one` / `other` |
| 俄文 / 阿拉伯文 | 6 个：`zero` `one` `two` `few` `many` `other` |

`pluralRules` 不传时，Vue I18n 自动用 `Intl.PluralRules(locale)`——99% 场景够用。

## 源码走读

```ts
// vue-i18n 内部 fallback 实现
function translateFallbackLocale(locales, key) {
  for (const locale of locales) {
    const message = getLocaleMessage(locale)[key]
    if (message !== undefined) return { message, locale }
  }
  return { message: key, locale: locales[0] }   // 全 miss 时返回 key 本身
}
```

注意：fallback 全 miss 时 `t(key)` 返回的是 key 字符串而非空——便于在 UI 上看到缺哪些翻译。

## 常见踩坑

- **`Intl` polyfill 缺失**：老 Safari / iOS 9 不支持 `Intl.PluralRules`；用 `@formatjs/intl-pluralrules` polyfill 或 `useI18n({ useFallbackWarn: false })`。
- **复数分支数错位**：`{n} item |||| {n} items` 看上去是 4 个 `|` 实际分 5 段。中文默认 2 段（0 / 1），英文 2 段（one / other），俄文 6 段。
- **fallback locale 链太长**：超过 3 层用户基本感受不到差异；保持 1-2 层。
- **d() 返回 Date 还是 string**：`d()` 默认返回格式化后的 string；要 Date 对象用 `d(new Date(), { key: 'short' }, 'datetime')` 配 `datetimeFormats`。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [vue-i18n 复数](https://vue-i18n.intlify.dev/guide/essentials/pluralization.html) | pipe 语法详解 |
| [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/) | 底层规范 |
| [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) | 浏览器原生格式化 |
| [相关 demo](./) | 04.vue-i18n 是入门与基础 t() 演示 |
