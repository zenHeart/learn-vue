<script setup lang="ts">
import { ref, computed } from 'vue'

/* ============================================================
 * 极简 h() + createVNode + patchFlag 推断
 * 仿 packages/runtime-core/src/vnode.ts 与 h.ts
 * ============================================================ */

// 位运算枚举
const enum PatchFlags {
  TEXT = 1,
  CLASS = 2,
  STYLE = 4,
  PROPS = 8,
  FULL_PROPS = 16,
  NEED_HYDRATION = 128,
  HOISTED = -1
}

// shape flag 枚举
const enum ShapeFlags {
  ELEMENT = 1,
  TEXT_CHILDREN = 1 << 3,   // 8
  ARRAY_CHILDREN = 1 << 4   // 16
}

let vnodeId = 0
function createBaseVNode(type: string, props: any = null, children: any = null, patchFlag = 0, dynamicProps: string[] | null = null) {
  const vnode: any = {
    __vid: ++vnodeId,
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag: ShapeFlags.ELEMENT
  }
  if (children) {
    if (typeof children === 'string') vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    else if (Array.isArray(children)) vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }
  return vnode
}

// 简易 patchFlag 推断：根据 props 特征累位
function inferPatchFlag(props: any): { flag: number; dynamicProps: string[] | null } {
  if (!props) return { flag: 0, dynamicProps: null }
  let flag = 0
  const dynamicProps: string[] = []
  for (const k of Object.keys(props)) {
    if (k === 'class' && typeof props[k] === 'object') { flag |= PatchFlags.CLASS; dynamicProps.push('class') }
    else if (k === 'style' && typeof props[k] === 'string') { flag |= PatchFlags.STYLE; dynamicProps.push('style') }
    else if (k.startsWith('on')) {} // 事件单独处理
    else if (k === 'id' || k === 'href' || k === 'src') { flag |= PatchFlags.PROPS; dynamicProps.push(k) }
    else if (typeof props[k] !== 'string') { flag |= PatchFlags.PROPS; dynamicProps.push(k) }
  }
  return { flag, dynamicProps: dynamicProps.length ? dynamicProps : null }
}

function h(type: string, props: any, children?: any) {
  const { flag, dynamicProps } = inferPatchFlag(props)
  return createBaseVNode(type, props, children, flag, dynamicProps)
}

const patchFlagTable: Record<number, string> = {
  [PatchFlags.TEXT]: 'TEXT',
  [PatchFlags.CLASS]: 'CLASS',
  [PatchFlags.STYLE]: 'STYLE',
  [PatchFlags.PROPS]: 'PROPS',
  [PatchFlags.FULL_PROPS]: 'FULL_PROPS',
  [PatchFlags.NEED_HYDRATION]: 'NEED_HYDRATION',
  [PatchFlags.HOISTED]: 'HOISTED'
}

function decodePatchFlag(flag: number): string[] {
  const result: string[] = []
  for (const k of Object.keys(patchFlagTable)) {
    const num = Number(k)
    if (num < 0) continue
    if (flag & num) result.push(patchFlagTable[num])
  }
  return result.length ? result : ['STATIC(0)']
}

/* ============================================================
 * 演示：构造多种 VNode 并打印
 * ============================================================ */

const examples = ref<{ name: string; vnode: any }[]>([
  { name: '静态文本节点', vnode: h('div', null, 'hello') },
  { name: '动态 class', vnode: h('div', { class: { active: true, large: false } }, 'click me') },
  { name: '动态 style + 动态文本', vnode: h('p', { style: 'color:red', id: 'a1' }, '{{ msg }}') },
  { name: '数组子节点', vnode: h('ul', null, [h('li', { key: 1 }, 'A'), h('li', { key: 2 }, 'B')]) },
  { name: '动态 src', vnode: h('img', { src: '/pic.png', alt: 'pic' }, null) }
])

const selectedIdx = ref(0)
const selected = computed(() => examples.value[selectedIdx.value])
</script>

<template>
  <div class="vnode-demo">
    <h3>04 · h() / VNode / patchFlag</h3>

    <div class="row">
      <span v-for="(ex, i) in examples" :key="i"
            :class="['pill', { active: selectedIdx === i }]"
            @click="selectedIdx = i">
        {{ ex.name }}
      </span>
    </div>

    <div class="grid">
      <section>
        <h4>输入 h() 调用</h4>
        <pre>{{ `h('${selected.vnode.type}', ${JSON.stringify(selected.vnode.props)}, ${JSON.stringify(selected.vnode.children)})` }}</pre>
      </section>

      <section>
        <h4>生成的 VNode</h4>
        <pre>{{ JSON.stringify(selected.vnode, null, 2) }}</pre>
      </section>

      <section>
        <h4>patchFlag 解析</h4>
        <p>数值: <b>{{ selected.vnode.patchFlag }}</b></p>
        <p>二进制: <code>{{ selected.vnode.patchFlag.toString(2).padStart(8, '0') }}</code></p>
        <p>含义:
          <span v-for="f in decodePatchFlag(selected.vnode.patchFlag)" :key="f" class="badge">{{ f }}</span>
        </p>
        <p v-if="selected.vnode.dynamicProps">
          dynamicProps: <code>{{ selected.vnode.dynamicProps.join(', ') }}</code>
        </p>
        <p>shapeFlag: {{ selected.vnode.shapeFlag }}
          ({{ (selected.vnode.shapeFlag & 8) ? 'TEXT_CHILDREN' : '' }}
          {{ (selected.vnode.shapeFlag & 16) ? 'ARRAY_CHILDREN' : '' }})
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.vnode-demo { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.row { display: flex; gap: .4rem; margin-bottom: 1rem; flex-wrap: wrap; }
.pill { padding: .3rem .7rem; border: 1px solid #aaa; border-radius: 999px; cursor: pointer; font-size: .8rem; }
.pill.active { background: #333; color: #fff; border-color: #333; }
.grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
section { background: #fafafa; padding: .75rem; border-radius: 6px; min-height: 260px; }
section h4 { margin: 0 0 .5rem; font-size: .9rem; }
pre { font-size: .75rem; white-space: pre-wrap; word-break: break-all; background: #fff; padding: .5rem; border: 1px solid #ddd; border-radius: 4px; }
.badge { display: inline-block; background: #333; color: #fff; font-size: .7rem; padding: .15rem .5rem; border-radius: 4px; margin: .15rem .2rem .15rem 0; }
</style>
