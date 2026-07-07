<template>
  <div>
    <h2>差异动画示例</h2>
    <transition-group name="list" tag="ul" class="list">
      <li v-for="item in items" :key="item" class="list-item">
        {{ item }}
      </li>
    </transition-group>
    <button @click="shuffle">打乱顺序</button>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const items = ref(['A', 'B', 'C', 'D', 'E'])
    const shuffle = () => {
      items.value = items.value.sort(() => Math.random() - 0.5)
    }
    return { items, shuffle }
  }
}
</script>

<style>
.list {
  padding: 0;
  list-style: none;
}

.list-item {
  margin: 5px 0;
  padding: 10px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: transform 0.3s, opacity 0.3s;
}

.list-item.list-move {
  transition: transform 0.3s;
}

.list-item.list-enter-active,
.list-item.list-leave-active {
  transition: opacity 0.3s;
}

.list-item.list-enter-from,
.list-item.list-leave-to {
  opacity: 0;
}
</style>