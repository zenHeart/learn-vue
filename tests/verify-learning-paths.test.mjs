import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

test('computed checker accepts comparisons and rejects ref assignments and increments', () => {
  const root = mkdtempSync(join(tmpdir(), 'learn-vue-check-'))
  const demo = join(root, 'src/learning-path/sample/src/01.cache')
  mkdirSync(join(demo, 'App'), { recursive: true })
  writeFileSync(join(demo, 'description.md'), '学习示例：预测缓存和副作用的区别。'.repeat(10))
  try {
    for (const [expression, expected] of [
      ["if (mode.value === 'static') return 1", 0],
      ["if (mode.value == 'static') return 1", 0],
      ['other.value = 1', 1],
      ['other.value++', 1],
    ]) {
      writeFileSync(join(demo, 'App/App.vue'), `<script setup>\nconst result = computed(() => { ${expression}; return 0 })\n</script>\n<template><p>缓存验证</p></template>`)
      const run = spawnSync(process.execPath, [resolve('scripts/verify-learning-paths.mjs')], { cwd: root, encoding: 'utf8' })
      assert.equal(run.status, expected, expression + '\n' + run.stdout)
    }
  } finally { rmSync(root, { recursive: true, force: true }) }
})
