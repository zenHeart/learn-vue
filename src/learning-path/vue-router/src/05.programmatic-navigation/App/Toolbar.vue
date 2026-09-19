<template>
  <div class="toolbar">
    <button @click="pushHome">router.push(首页)</button>
    <button @click="pushEditor">push 编辑器</button>
    <button @click="replacePreview">replace 预览页</button>
    <button @click="pushInvalid">push 不存在的路由</button>
    <button @click="resolveOnly">resolve 不跳转</button>
    <button @click="goBack">back()</button>
    <button @click="goForward">forward()</button>
    <button @click="goDelta">go(-2)</button>
  </div>
</template>

<script setup>
import { useRouter, isNavigationFailure, NavigationFailureType } from 'vue-router'

const router = useRouter()

async function pushHome() {
  const res = await router.push({ name: 'home' })
  logResult('pushHome', res)
}

async function pushEditor() {
  const res = await router.push('/editor')
  logResult('pushEditor', res)
}

async function replacePreview() {
  // replace 替换当前栈顶，不会留下历史
  const res = await router.replace({ name: 'preview', params: { draftId: 'd-42' }, query: { token: 'abc' } })
  logResult('replacePreview', res)
}

async function pushInvalid() {
  const failure = await router.push('/no/such/route')
  if (isNavigationFailure(failure, NavigationFailureType.resolved)) {
    console.warn('导航解析失败:', failure)
    logResult('pushInvalid', `resolved 失败: ${failure.message}`)
  } else {
    logResult('pushInvalid', failure ?? '成功')
  }
}

function resolveOnly() {
  const resolved = router.resolve({ name: 'preview', params: { draftId: 'preview-only' } })
  logResult('resolveOnly', resolved.href)
}

function goBack() { router.back(); logResult('back()', '') }
function goForward() { router.forward(); logResult('forward()', '') }
function goDelta() { router.go(-2); logResult('go(-2)', '') }

function logResult(name, info) {
  // eslint-disable-next-line no-console
  console.log(`[nav:${name}]`, info)
}
</script>