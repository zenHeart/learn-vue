<template>
  <div class="demo">
    <h2>18 · v-for ref 数组：patch 后的 DOM 顺序</h2>

    <section class="card">
      <h3>① 字符串 ref：ref="elRefs" → ref<HTMLElement[]></h3>
      <p>点击"打乱顺序"改变 items 数组，但 <strong>通过 key 让 DOM 复用</strong>；观察 ref 数组与 items 顺序是否一致。</p>
      <div class="row">
        <button @click="shuffle">打乱 items 顺序</button>
        <button @click="reverse">倒序 items</button>
        <button @click="log">打印 ref 数组</button>
      </div>
      <ul class="list">
        <li v-for="(it, i) in items" :key="it.id" :ref="elRefs">
          #{{ i }} — id={{ it.id }} — text="{{ it.text }}"
        </li>
      </ul>
      <p class="hint">
        数据源顺序：<code>{{ items.map(i => i.text).join(' → ') }}</code><br />
        ref 数组顺序（按 patch 后 DOM）：<code>{{ refTexts.join(' → ') }}</code>
      </p>
    </section>

    <section class="card">
      <h3>② useTemplateRef（3.5+）：类型推断 + shallowRef</h3>
      <ul class="list">
        <li v-for="it in items2" :key="it" :ref="listRefs2">{{ it }}</li>
      </ul>
      <p class="hint">useTemplateRef('listRefs2') 的 .value 类型：<code>{{ typeof listRefs2.value }} / {{ Array.isArray(listRefs2.value) ? 'array' : 'null' }}</code></p>
      <pre>{{ dump }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

interface Item { id: number; text: string }

// ① 字符串 ref 演示
const items = ref<Item[]>(
  Array.from({ length: 5 }, (_, i) => ({ id: i + 1, text: `行 ${i + 1}` })),
)
// 注意：ref="elRefs" 模板中不能直接写数组类型注解，运行时得到 (HTMLElement | null)[]
// 通过 onMounted 后再 cast 来使用
const elRefs = ref<(HTMLElement | null)[]>([])
const refTexts = ref<string[]>([])

function shuffle() {
  items.value = [...items.value].sort(() => Math.random() - 0.5)
  // 等到 patch 完成后重新读取 ref 数组
  queueMicrotask(() => {
    refTexts.value = elRefs.value
      .filter((el): el is HTMLElement => !!el)
      .map((el) => el.textContent?.trim() ?? '')
  })
}
function reverse() {
  items.value = [...items.value].reverse()
  queueMicrotask(() => {
    refTexts.value = elRefs.value
      .filter((el): el is HTMLElement => !!el)
      .map((el) => el.textContent?.trim() ?? '')
  })
}
function log() {
  // 强制刷新一次，避免缓存
  refTexts.value = elRefs.value
    .filter((el): el is HTMLElement => !!el)
    .map((el) => el.textContent?.trim() ?? '')
  console.log('[ref]', elRefs.value)
}

// ② useTemplateRef 演示（3.5+）
const items2 = ref(['apple', 'banana', 'cherry', 'date'])
const listRefs2 = useTemplateRef<HTMLLIElement[]>('listRefs2')

const dump = ref('点击 log 查看')
function dump2() {
  dump.value = JSON.stringify(listRefs2.value?.map(el => el?.textContent?.trim() ?? ''), null, 2)
}
dump2()
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.row { display: flex; gap: 6px; margin-bottom: 8px; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.list { list-style: none; padding: 0; margin: 0; }
.list li { padding: 6px 10px; margin: 2px 0; background: #fff7e6; border: 1px solid #ffd591; border-radius: 4px; }
.hint { font-size: 12px; color: #555; margin-top: 8px; }
code { background: #f6f8fa; padding: 1px 4px; border-radius: 3px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 8px; font-size: 12px; border-radius: 4px; max-height: 200px; overflow: auto; }
</style>
