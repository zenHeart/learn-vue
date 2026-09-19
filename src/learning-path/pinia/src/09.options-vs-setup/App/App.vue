<template>
  <div class="app">
    <h2>Options vs Setup</h2>
    <p class="hint">同一份"任务清单"用两种 store 写法各实现一次</p>

    <section>
      <h3>Options Store（默认支持 $reset）</h3>
      <button @click="opt.add(`任务 ${++seq}`)">+ 添加</button>
      <button @click="opt.$reset()">$reset</button>
      <p>remaining={{ opt.remaining }}　finished={{ opt.finished }}</p>
      <ul>
        <li v-for="t in opt.items" :key="t.id">
          <input type="checkbox" :checked="t.done" @change="opt.toggle(t.id)" />
          <span :class="{ done: t.done }">{{ t.text }}</span>
        </li>
      </ul>
    </section>

    <section>
      <h3>Setup Store（自带 $reset）</h3>
      <button @click="setup.add(`任务 ${++seq}`)">+ 添加</button>
      <button @click="setup.$reset()">$reset</button>
      <p>remaining={{ setup.remaining }}　finished={{ setup.finished }}</p>
      <ul>
        <li v-for="t in setup.items" :key="t.id">
          <input type="checkbox" :checked="t.done" @change="setup.toggle(t.id)" />
          <span :class="{ done: t.done }">{{ t.text }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTasksOptions, useTasksSetup } from './store'

const opt = useTasksOptions()
const setup = useTasksSetup()
const seq = ref(0)
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app section { padding: .75rem; margin-top: 1rem; border: 1px solid #eaecef; border-radius: 6px; background: #fff; }
.app button { padding: .25rem .6rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; margin-right: .25rem; }
.app ul { list-style: none; padding: 0; margin: .5rem 0 0; }
.app li { display: flex; gap: .5rem; padding: .15rem 0; }
.app .done { text-decoration: line-through; color: #6e7781; }
</style>