# Vue 无缝滚动组件实现详解

> 实现基于 requestAnimationFrame 的无缝滚动效果，支持 Vue 2 和 Vue 3

## Table of Contents

[[toc]]

---

## 1. 无缝滚动原理

### 1.1 核心思想

无缝滚动的核心原理是**视觉欺骗**：

1. 将列表内容复制一份放置在原始列表后面
2. 当第一份内容滚动出视野时，利用**重置位置**技巧跳回起点
3. 由于重置是瞬间完成的，用户察觉不到任何跳跃

```
原始列表:  [A] [B] [C] [D]
复制后:    [A] [B] [C] [D] | [A] [B] [C] [D]

滚动过程:
1. 显示 [A][B][C][D]|[A]...
2. 继续滚动到显示 [D]|[A][B][C]...
3. 当 [D] 完全滚出视野时，立即重置到开头
4. 用户看到的是连续滚动的效果
```

### 1.2 实现要点

| 要点 | 说明 |
|------|------|
| requestAnimationFrame | 60fps 平滑动画，比 setInterval 更高效 |
| 滚动位置计算 | 跟踪当前偏移量，累加滚动速度 |
| 边界检测 | 当偏移量 >= 单份列表长度时，重置为 0 |
| CSS overflow: hidden | 隐藏溢出部分，只显示一份列表的宽度 |

---

## 2. Vue 2 版本实现 (vue-seamless-scroll)

### 2.1 安装

```bash
npm install vue-seamless-scroll
```

### 2.2 基本用法

```vue
<template>
  <vue-seamless-scroll :list="list" class="scroll-container">
    <div v-for="item in list" :key="item.id" class="item">
      {{ item.title }}
    </div>
  </vue-seamless-scroll>
</template>

<script>
import vueSeamlessScroll from 'vue-seamless-scroll'

export default {
  components: { vueSeamlessScroll },
  data() {
    return {
      list: [
        { id: 1, title: '新闻标题 1' },
        { id: 2, title: '新闻标题 2' },
        // ...
      ]
    }
  }
}
</script>

<style>
.scroll-container {
  height: 200px;
  width: 100%;
  overflow: hidden;
}
</style>
```

### 2.3 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| list | Array | [] | 滚动数据列表 |
| step | Number | 1 | 每次滚动距离（px） |
| limitMoveNum | Number | 5 | 开始滚动的最小数据数 |
| hoverStop | Boolean | true | 鼠标悬停是否停止滚动 |
| direction | Number | 1 | 1 向下/向右，2 向上/向左 |
| openTouch | Boolean | true | 移动端触摸滚动 |
| singleHeight | Number | 0 | 单条数据高度（配合 step 使用） |
| waitTime | Number | 1000 | 停止后的等待时间(ms) |

---

## 3. Vue 3 版本兼容方案

### 3.1 方案一：使用 vue3-seamless-scroll

```bash
npm install vue3-seamless-scroll
```

```vue
<template>
  <vue3-seamless-scroll :list="list" class="scroll-container">
    <div v-for="item in list" :key="item.id" class="item">
      {{ item.title }}
    </div>
  </vue3-seamless-scroll>
</template>

<script setup>
import vue3SeamlessScroll from 'vue3-seamless-scroll'

const list = ref([
  { id: 1, title: '新闻标题 1' },
  { id: 2, title: '新闻标题 2' },
  // ...
])
</script>
```

### 3.2 方案二：手写简单实现（推荐）

如果只需要基础功能，可以自己实现一个轻量版本：

```vue
<template>
  <div class="seamless-scroll-container" ref="containerRef">
    <div class="seamless-scroll-content" ref="contentRef">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  direction: {
    type: String,
    default: 'up' // 'up' | 'down' | 'left' | 'right'
  },
  speed: {
    type: Number,
    default: 1  // 每次滚动的距离(px)
  },
  step: {
    type: Number,
    default: 16.67 // 约 60fps
  },
  autoPlay: {
    type: Boolean,
    default: true
  }
})

const containerRef = ref(null)
const contentRef = ref(null)
let animationId = null
let currentOffset = 0

const scroll = () => {
  if (!contentRef.value || !containerRef.value) return

  const content = contentRef.value
  const container = containerRef.value

  // 根据方向计算滚动量
  const scrollSize = props.direction === 'up' || props.direction === 'down'
    ? content.offsetHeight / 2  // 垂直滚动用高度
    : content.offsetWidth / 2   // 水平滚动用宽度

  // 累加偏移量
  currentOffset += props.speed

  // 设置滚动位置
  if (props.direction === 'up') {
    content.style.transform = `translateY(-${currentOffset}px)`
  } else if (props.direction === 'down') {
    content.style.transform = `translateY(${currentOffset}px)`
  } else if (props.direction === 'left') {
    content.style.transform = `translateX(-${currentOffset}px)`
  } else {
    content.style.transform = `translateX(${currentOffset}px)`
  }

  // 边界重置 - 无缝关键
  if (currentOffset >= scrollSize) {
    currentOffset = 0
    content.style.transition = 'none' // 瞬间重置，无动画
    content.style.transform = 'translate(0, 0)'
    // 强制重绘
    content.offsetHeight
    content.style.transition = '' // 恢复动画
  }

  animationId = requestAnimationFrame(scroll)
}

const start = () => {
  if (animationId) return
  animationId = requestAnimationFrame(scroll)
}

const stop = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

onMounted(() => {
  if (props.autoPlay) {
    start()
  }
})

onUnmounted(() => {
  stop()
})

// 暴露控制方法
defineExpose({ start, stop })
</script>

<style scoped>
.seamless-scroll-container {
  overflow: hidden;
  position: relative;
}

.seamless-scroll-content {
  display: flex;
  will-change: transform;
}
</style>
```

---

## 4. 核心原理深入解析

### 4.1 requestAnimationFrame vs setInterval

```javascript
// ❌ 不推荐：setInterval 固定间隔，可能丢帧
setInterval(() => {
  offset += speed
}, 16)

// ✅ 推荐：requestAnimationFrame 浏览器优化，不丢帧
const scroll = () => {
  offset += speed
  element.style.transform = `translateY(-${offset}px)`
  requestAnimationFrame(scroll)
}
requestAnimationFrame(scroll)
```

| 特性 | requestAnimationFrame | setInterval |
|------|----------------------|-------------|
| 帧率 | 浏览器自动优化（通常 60fps） | 固定间隔 |
| 页面不可见 | 自动暂停 | 继续运行 |
| 电池友好 | 是 | 否 |
| 精度 | 高 | 低 |

### 4.2 无缝的关键：双倍内容 + 边界重置

```
假设列表高度 = 400px，内容复制后 = 800px

滚动过程:
0px:     显示 [内容1内容2内容3内容4] [内容1内容2...]
50px:    显示 [████内容2内容3内容4] [内容1内容2...]
400px:   显示 [██████████████] [内容1内容2...] ← 刚好重置点
401px:   重置 currentOffset = 0，显示 [内容1内容2内容3内容4] [内容1...]
```

### 4.3 克隆内容的两种方式

```javascript
// 方式 1：直接复制 DOM 节点（推荐，简单）
content.innerHTML += content.innerHTML

// 方式 2：手动克隆节点（更灵活）
const clone = content.cloneNode(true)
content.appendChild(clone)
```

---

## 5. 完整示例

### 5.1 新闻列表滚动

```vue
<template>
  <div class="news-container">
    <h3>热点新闻</h3>
    <div
      class="scroll-wrapper"
      ref="wrapperRef"
      @mouseenter="stopScroll"
      @mouseleave="startScroll"
    >
      <div class="scroll-content" ref="contentRef">
        <div
          v-for="item in displayList"
          :key="item.id"
          class="news-item"
          @click="handleClick(item)"
        >
          <span class="tag" :class="item.tag">{{ item.tag }}</span>
          <span class="title">{{ item.title }}</span>
          <span class="time">{{ item.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  },
  speed: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['click'])

const wrapperRef = ref(null)
const contentRef = ref(null)
const currentOffset = ref(0)
let animationId = null
let isPaused = false

// 双倍内容实现无缝
const displayList = computed(() => [...props.list, ...props.list])

const scroll = () => {
  if (!contentRef.value || isPaused) return

  currentOffset.value += props.speed
  const singleHeight = contentRef.value.offsetHeight / 2

  if (currentOffset.value >= singleHeight) {
    currentOffset.value = 0
  }

  contentRef.value.style.transform = `translateY(-${currentOffset.value}px)`
  animationId = requestAnimationFrame(scroll)
}

const startScroll = () => {
  if (animationId) return
  isPaused = false
  animationId = requestAnimationFrame(scroll)
}

const stopScroll = () => {
  isPaused = true
}

const handleClick = (item) => {
  emit('click', item)
}

onMounted(() => {
  startScroll()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.news-container {
  width: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.news-container h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.scroll-wrapper {
  height: 200px;
  overflow: hidden;
}

.scroll-content {
  will-change: transform;
}

.news-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.2s;
}

.news-item:hover {
  background: #f5f5f5;
}

.news-item .tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 8px;
}

.news-item .tag.hot {
  background: #ff4757;
  color: #fff;
}

.news-item .tag.new {
  background: #2ed573;
  color: #fff;
}

.news-item .title {
  flex: 1;
  color: #333;
}

.news-item .time {
  color: #999;
  font-size: 12px;
  margin-left: 8px;
}
</style>
```

### 5.2 水平滚动（图片轮播）

```vue
<template>
  <div
    class="carousel-container"
    ref="containerRef"
    @mouseenter="stopScroll"
    @mouseleave="startScroll"
  >
    <div class="carousel-track" ref="trackRef">
      <img
        v-for="img in displayImages"
        :key="img.id"
        :src="img.src"
        :alt="img.alt"
        class="carousel-item"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  speed: {
    type: Number,
    default: 2
  }
})

const containerRef = ref(null)
const trackRef = ref(null)
let currentOffset = 0
let animationId = null
let isPaused = false

const displayImages = computed(() => [...props.images, ...props.images])

const scroll = () => {
  if (!trackRef.value || isPaused) return

  currentOffset += props.speed
  const singleWidth = trackRef.value.offsetWidth / 2

  if (currentOffset >= singleWidth) {
    currentOffset = 0
  }

  trackRef.value.style.transform = `translateX(-${currentOffset}px)`
  animationId = requestAnimationFrame(scroll)
}

const startScroll = () => {
  if (animationId) return
  isPaused = false
  animationId = requestAnimationFrame(scroll)
}

const stopScroll = () => {
  isPaused = true
}

onMounted(() => {
  startScroll()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.carousel-container {
  width: 100%;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  gap: 20px;
  will-change: transform;
}

.carousel-item {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
</style>
```

---

## 6. 性能优化

### 6.1 使用 CSS will-change

```css
.scroll-content {
  will-change: transform; /* 提示浏览器提前优化 */
}
```

### 6.2 硬件加速

```css
.scroll-content {
  transform: translateZ(0); /* 强制使用 GPU 加速 */
  backface-visibility: hidden;
}
```

### 6.3 减少重排重绘

```javascript
// ❌ 频繁读取布局属性
element.style.top = offset + 'px'
element.style.left = offset + 'px'

// ✅ 使用 transform
element.style.transform = `translate(${x}px, ${y}px)`
```

---

## 7. 常见问题

### Q1: 为什么需要双倍内容？

双倍内容是无缝效果的关键。只有一份内容时，滚动到末尾会出现空白。双倍后，当第一份滚出视野时，第二份刚好接上，用户察觉不到重置。

### Q2: 如何处理鼠标悬停停止？

```javascript
element.addEventListener('mouseenter', () => {
  isPaused = true
})

element.addEventListener('mouseleave', () => {
  isPaused = false
})
```

### Q3: 移动端如何支持？

移动端使用触摸事件，通过 `touchstart`、`touchmove`、`touchend` 计算滚动方向和距离。

---

## 8. 交互式演示

打开演示页面：[vue-seamless-scroll.html](../../examples/vue3/demos/vue-seamless-scroll.html)

演示包含：
1. 垂直滚动（新闻列表）
2. 水平滚动（图片轮播）
3. 鼠标悬停控制
4. 可调速度控制

---

## 相关资源

- [MDN: requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)
- [vue-seamless-scroll npm](https://www.npmjs.com/package/vue-seamless-scroll)
- [vue3-seamless-scroll npm](https://www.npmjs.com/package/vue3-seamless-scroll)
