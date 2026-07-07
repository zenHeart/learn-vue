<template>
  <div>
    <h2>Vue 3 全局属性示例</h2>
    <div class="demo">
      <div class="section">
        <h3>全局属性使用示例</h3>
        <p>当前环境: {{ $env }}</p>
        <p>API 版本: {{ $apiVersion }}</p>
        <p>格式化后的日期: {{ $formatDate(new Date()) }}</p>
        <p>格式化后的金额: {{ $formatCurrency(1234.56) }}</p>
      </div>
      <div class="section">
        <h3>全局属性方法调用</h3>
        <button @click="showNotification">显示通知</button>
        <button @click="showConfirm">显示确认框</button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'GlobalPropertiesDemo',
  setup() {
    const showNotification = () => {
      // 使用全局属性方法
      window.$notify({
        title: '通知',
        message: '这是一条全局通知消息',
        type: 'success'
      })
    }

    const showConfirm = () => {
      // 使用全局属性方法
      window.$confirm({
        title: '确认',
        message: '确定要执行此操作吗？',
        type: 'warning'
      }).then(() => {
        window.$notify({
          title: '成功',
          message: '操作已确认',
          type: 'success'
        })
      }).catch(() => {
        window.$notify({
          title: '取消',
          message: '操作已取消',
          type: 'info'
        })
      })
    }

    return {
      showNotification,
      showConfirm
    }
  }
})
</script>

<style>
.demo {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

button {
  padding: 8px 16px;
  margin-right: 10px;
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