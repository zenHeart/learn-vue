<script setup>
import { ref } from 'vue'

// 这里只展示 SVG 字符串模拟 unplugin-icons 编译产物
// 真实项目中：<template><IconMdiAccount /></template> 由插件自动 import

const icons = [
  { name: 'IconMdiAccount', label: '账户', path: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' },
  { name: 'IconMdiHomeVariant', label: '首页', path: 'M12,3L2,12H5V20H19V12H22L12,3M12,8A2,2 0 0,1 14,10A2,2 0 0,1 12,12A2,2 0 0,1 10,10A2,2 0 0,1 12,8Z' },
  { name: 'IconMdiMagnify', label: '搜索', path: 'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' },
  { name: 'IconMdiCart', label: '购物车', path: 'M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.96,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18A2,2 0 0,0 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20A2,2 0 0,0 7,18M17,18A2,2 0 0,0 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20A2,2 0 0,0 17,18Z' },
  { name: 'IconMdiBell', label: '通知', path: 'M12,22C13.1,22 14,21.1 14,20H10A2,2 0 0,0 12,22M18,16V11C18,7.93 16.36,5.36 13.5,4.68V4A1.5,1.5 0 0,0 12,2.5A1.5,1.5 0 0,0 10.5,4V4.68C7.63,5.36 6,7.92 6,11V16L4,18V19H20V18L18,16Z' },
  { name: 'IconMdiCog', label: '设置', path: 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z' },
]

const selected = ref(null)
</script>

<template>
  <div class="card">
    <h2>unplugin-icons 自动注册</h2>
    <p class="hint">
      模板里写 <code>&lt;IconMdiAccount /&gt;</code>，插件扫到 <code>Icon</code> 前缀 + <code>Mdi</code> 集合，
      自动 import 对应 SVG。bundle 里只出现用到的图标，全量 @iconify 不进。
    </p>

    <div class="grid">
      <button
        v-for="icon in icons"
        :key="icon.name"
        class="icon-btn"
        :class="{ active: selected === icon.name }"
        @click="selected = icon.name"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path :d="icon.path" fill="currentColor" />
        </svg>
        <span>{{ icon.label }}</span>
      </button>
    </div>

    <p v-if="selected" class="usage">
      模板写法：<code>&lt;{{ selected }} /&gt;</code>
    </p>

    <h3>编译产物（vite-plugin-icons）</h3>
    <pre>import {{ '{' }} {{ selected || 'IconMdiAccount' }} as _Account {{ '}' }} from '@iconify-icons/mdi/account'
export function render() {{ '{' }} return _Account {{ '}' }}</pre>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 520px; }
.card h2 { margin: 0 0 6px; font-size: 1rem; }
.hint { font-size: 0.78rem; color: #666; margin: 0 0 12px; line-height: 1.5; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.82rem; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 12px; }
.icon-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px; border: 1px solid #ddd; background: #fff; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
.icon-btn:hover { border-color: #42b883; }
.icon-btn.active { background: #42b883; color: #fff; border-color: #42b883; }
.icon-btn span { font-size: 0.75rem; }
.usage { background: #f0f9eb; padding: 6px 10px; border-radius: 6px; font-size: 0.82rem; }
.card h3 { margin: 12px 0 6px; font-size: 0.85rem; color: #35495e; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 8px 10px; border-radius: 6px; font-size: 0.72rem; line-height: 1.55; overflow-x: auto; margin: 0; }
</style>
