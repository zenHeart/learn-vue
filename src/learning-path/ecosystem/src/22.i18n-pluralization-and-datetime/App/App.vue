<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, d, n, locale } = useI18n()

const count = ref(0)
const appleCount = ref(3)

// 测试多种数字的复数分支
const pluralTests = computed(() => [0, 1, 2, 5].map(c => ({
  count: c,
  cart: t('cart', c),
  apple: t('apple', c),
})))

// fallback 演示
const fallbackKey = ref('missing.only_in_en')
const fallbackOutput = computed(() => t(fallbackKey.value))

// 切换语言
const messages = {
  'zh-CN': {
    cart: '购物车 | {count} 件商品',
    apple: '没有苹果 | 1 个苹果 | {count} 个苹果',
    lastSeen: '上次登录：{date}',
    currency: '人民币',
  },
  en: {
    cart: '{count} item |||| {count} items',
    apple: 'no apples | 1 apple | {count} apples',
    lastSeen: 'Last seen: {date}',
    currency: 'USD',
    missing: {
      only_in_en: 'This key only exists in en, fallback chain kicks in',
    },
  },
}

// 模拟 fallback 链：locale = 'zh-CN', fallbackLocale = ['en']
const fallbackChain = computed(() => {
  const chain = ['zh-CN', 'en']
  return chain.map(l => `${l}: ${messages[l].cart.split('|')[0].trim()}`).join(' → ')
})

function switchLocale() {
  locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
}

const now = new Date()
</script>

<template>
  <div class="card">
    <h2>vue-i18n 复数 + 日期时间</h2>
    <p class="hint">
      <code>t()</code> 第二个参数走 ICU 复数规则，<code>d()</code> 走 <code>Intl.DateTimeFormat</code>。
      当目标 locale 缺 key，fallback 链按 <code>['en', 'zh-TW']</code> 顺序回退。
    </p>

    <div class="row">
      <button class="primary" @click="switchLocale">切换到 {{ locale === 'zh-CN' ? 'en' : 'zh-CN' }}</button>
      <span class="meta">当前 locale: <code>{{ locale }}</code></span>
    </div>

    <section>
      <h3>1. 复数（pluralization）</h3>
      <table class="table">
        <thead>
          <tr><th>count</th><th>cart</th><th>apple</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in pluralTests" :key="row.count">
            <td><strong>{{ row.count }}</strong></td>
            <td>{{ row.cart }}</td>
            <td>{{ row.apple }}</td>
          </tr>
        </tbody>
      </table>
      <p class="meta">
        中文永远走 'other' 分支（无复数变化）；英文走 'one' / 'other'。
      </p>
    </section>

    <section>
      <h3>2. 日期时间</h3>
      <p><code>d(new Date(), 'short')</code>: <strong>{{ d(now, 'short') }}</strong></p>
      <p><code>d(new Date(), 'long')</code>: <strong>{{ d(now, 'long') }}</strong></p>
      <p><code>d(new Date(), 'long', 'en')</code>: <strong>{{ d(now, 'long', 'en') }}</strong></p>
    </section>

    <section>
      <h3>3. 数字 / 货币</h3>
      <p><code>n(1234.5, 'currency', { currency: 'USD' })</code>:
        <strong>{{ n(1234.5, 'currency', { currency: 'USD' }) }}</strong>
      </p>
      <p><code>n(0.876, 'percent')</code>:
        <strong>{{ n(0.876, 'percent') }}</strong>
      </p>
    </section>

    <section>
      <h3>4. Fallback 链</h3>
      <p>查找 key <code>{{ fallbackKey }}</code>，当前 locale = <strong>{{ locale }}</strong>：</p>
      <p class="result">{{ fallbackOutput }}</p>
      <p class="meta">解析链：<code>{{ fallbackChain }}</code></p>
    </section>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 540px; }
.card h2 { margin: 0 0 6px; font-size: 1rem; }
.card h3 { margin: 12px 0 6px; font-size: 0.9rem; color: #35495e; }
.hint { font-size: 0.78rem; color: #666; margin: 0 0 10px; line-height: 1.55; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.78rem; }
.row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.meta { font-size: 0.75rem; color: #888; }
button { padding: 5px 12px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; font-size: 0.82rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
section { margin: 10px 0; padding: 10px; background: #f6f8fa; border-radius: 8px; }
.table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.table th, .table td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
.table th { color: #666; font-weight: 500; font-size: 0.75rem; }
p { margin: 4px 0; font-size: 0.85rem; }
.result { background: #f0f9eb; border: 1px solid #42b883; padding: 6px 10px; border-radius: 6px; font-size: 0.85rem; }
</style>
