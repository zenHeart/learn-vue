import test from 'node:test'
import assert from 'node:assert/strict'
import { createCacheDemo } from '../src/learning-path/reactivity/src/15.computed-dirty-and-cache/App/model.js'

test('cache identity changes only after its dependency changes; watch performs synchronization', () => {
  const demo = createCacheDemo()
  try {
    const initial = demo.double.value
    assert.equal(initial.value, 2)
    assert.equal(demo.double.value, initial)
    assert.equal(demo.count.value, 1, 'reading a getter must not mutate its source')
    demo.echo.value = 'unrelated change'
    assert.equal(demo.double.value, initial)
    demo.count.value++
    assert.notEqual(demo.double.value, initial)
    assert.equal(demo.double.value.value, 4)
    assert.equal(demo.c.value, 5)
    assert.equal(demo.echo.value, 'synced from count = 2')
    assert.equal(demo.double.value, demo.double.value)
  } finally { demo.stop() }
})
