<template>
  <div class="typed-counter">
    <button @click="dec">-</button>
    <strong>{{ count }}</strong>
    <button @click="inc">+</button>
    <span class="step">step = {{ step }}</span>
  </div>
</template>

<script setup lang="ts">
// start / step 都是 number；Volar 在 App.vue 里 :start="hello" 会报错
const props = defineProps<{
  start: number
  step?: number
}>()

const count = ref(props.start)
const step = computed(() => props.step ?? 1)

function inc() { count.value += step.value }
function dec() { count.value -= step.value }
</script>

<style scoped>
.typed-counter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #42b883;
  border-radius: 6px;
}
.typed-counter button {
  width: 28px;
  height: 28px;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.typed-counter strong {
  min-width: 30px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.typed-counter .step {
  margin-left: 8px;
  color: #64748b;
  font-size: 12px;
}
</style>