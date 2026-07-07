<template>
  <div>
    <h2>Vue 3 函数组件示例</h2>
    <div class="demo">
      <div class="controls">
        <button @click="toggleTheme">切换主题</button>
        <button @click="increment">增加计数</button>
      </div>
      <functional-counter
        :count="count"
        :theme="theme"
        @increment="increment"
      />
      <functional-theme-switcher
        :theme="theme"
        @toggle="toggleTheme"
      />
    </div>
  </div>
</template>

<script>
import { ref, defineComponent } from 'vue'

// 函数组件：计数器
const FunctionalCounter = defineComponent({
  name: 'FunctionalCounter',
  props: {
    count: {
      type: Number,
      required: true
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  emits: ['increment'],
  setup(props, { emit }) {
    return () => (
      <div class={`counter ${props.theme}`}>
        <h3>函数组件计数器</h3>
        <p>当前计数: {props.count}</p>
        <button onClick={() => emit('increment')}>增加</button>
      </div>
    )
  }
})

// 函数组件：主题切换器
const FunctionalThemeSwitcher = defineComponent({
  name: 'FunctionalThemeSwitcher',
  props: {
    theme: {
      type: String,
      required: true
    }
  },
  emits: ['toggle'],
  setup(props, { emit }) {
    return () => (
      <div class={`theme-switcher ${props.theme}`}>
        <h3>函数组件主题切换器</h3>
        <p>当前主题: {props.theme}</p>
        <button onClick={() => emit('toggle')}>切换主题</button>
      </div>
    )
  }
})

export default defineComponent({
  components: {
    FunctionalCounter,
    FunctionalThemeSwitcher
  },
  setup() {
    const count = ref(0)
    const theme = ref('light')

    const increment = () => {
      count.value++
    }

    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }

    return {
      count,
      theme,
      increment,
      toggleTheme
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

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.counter,
.theme-switcher {
  padding: 20px;
  margin: 10px 0;
  border-radius: 4px;
}

.counter.light,
.theme-switcher.light {
  background: #f5f5f5;
  color: #333;
}

.counter.dark,
.theme-switcher.dark {
  background: #333;
  color: #fff;
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