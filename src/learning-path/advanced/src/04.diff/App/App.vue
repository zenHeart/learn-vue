<template>
  <div>
    <h2>Vue 3 差异比较示例</h2>
    <div class="demo">
      <div class="list">
        <div v-for="(item, index) in list" :key="item.id" class="item">
          {{ item.text }}
          <button @click="removeItem(index)">删除</button>
        </div>
      </div>
      <div class="controls">
        <button @click="addItem">添加项目</button>
        <button @click="shuffleList">打乱顺序</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const list = ref([
      { id: 1, text: '项目 1' },
      { id: 2, text: '项目 2' },
      { id: 3, text: '项目 3' }
    ])

    const addItem = () => {
      const newId = list.value.length + 1
      list.value.push({ id: newId, text: `项目 ${newId}` })
    }

    const removeItem = (index) => {
      list.value.splice(index, 1)
    }

    const shuffleList = () => {
      list.value = list.value.sort(() => Math.random() - 0.5)
    }

    return {
      list,
      addItem,
      removeItem,
      shuffleList
    }
  }
}
</script>

<style>
.demo {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.list {
  margin-bottom: 20px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  background: #f5f5f5;
  border-radius: 4px;
}

.controls {
  display: flex;
  gap: 10px;
}

button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #45a049;
}
</style> 