<template>
  <section>
    <h3>Profile</h3>
    <p>当前用户: <input v-model="name" /></p>
    <p class="hint">填好后切走再切回,输入值会保留 —— 因为组件实例未被销毁。</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const name = ref('')
</script>
