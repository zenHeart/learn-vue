<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PropType } from 'vue';

interface SidebarItem {
  text?: string;
  title?: string;
  link?: string;
  items?: SidebarItem[];
}

const props = defineProps({
  sidebar: {
    type: Array as PropType<SidebarItem[]>
  }
});

const openGroups = ref<number[]>([]);

const toggleGroup = (index: number) => {
  if (openGroups.value.includes(index)) {
    openGroups.value = openGroups.value.filter(i => i !== index);
  } else {
    openGroups.value.push(index);
  }
};

onMounted(() => {
    // 可以在这里根据路由信息或其他条件设置默认打开的分组
    // 例如，如果当前在 /learning-path/01.concept/，则默认打开 01.concept 分组
});
</script>

<template>
  <div class="home-container">
    <main>
      <section class="learning-paths-grid">
        <template v-for="(group, index) in props.sidebar">
          <div class="learning-path-card" @click="toggleGroup(index)">
            <div class="card-content">
              <h3>{{ group.text || group.title }}</h3>
              <p>{{ group.items && group.items[0]?.description || 'Click to view sub-topics.' }}</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
            <div class="timeline-children" :class="{ open: openGroups.includes(index) }">
              <template v-for="(item, subIndex) in group.items">
                <div v-if="item.items" class="timeline-children-level-2">
                  <TimelineGroup
                    :group="item"
                    :depth="1"
                    :defaultOpen="false"
                  />
                </div>
                <a v-else :href="item.link" class="timeline-card">
                  {{ item.text || item.title }}
                </a>
              </template>
            </div>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
:root {
  --font-family-primary: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --color-text-dark: #333;
  --color-text-light: #666;
  --color-primary: #42b883;
  --color-bg: #f8f8f8;
  --border-radius: 8px;
  --box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
}

body {
  font-family: var(--font-family-primary);
  color: var(--color-text-dark);
  margin: 0;
  padding: 0;
  background-color: var(--color-bg);
  line-height: 1.7;
}

.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-logo {
  margin-right: 20px;
  font-size: 1.5em;
  color: var(--color-primary);
  font-weight: bold;
}

.navbar-links {
  display: flex;
  align-items: center;
}

.navbar-links a {
  color: var(--color-text-light);
  text-decoration: none;
  margin-left: 25px;
  transition: var(--transition);
  font-weight: 500;
}

.navbar-links a:hover {
  color: var(--color-primary);
}

.navbar-right {
  display: flex;
  align-items: center;
}

.navbar-icon {
  color: var(--color-text-light);
  margin-left: 25px;
  cursor: pointer;
  transition: var(--transition);
  font-size: 1.2em;
}

.navbar-icon:hover {
  color: var(--color-primary);
}

.home-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0 48px 0;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3em;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
  color: var(--color-text-dark);
}

.vue-gradient {
  background: linear-gradient(90deg, var(--vp-c-brand) 30%, var(--vp-c-brand-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1.1em;
  color: var(--color-text-light);
  line-height: 1.8;
  margin-bottom: 0;
  max-width: 90%;
  margin: 0 auto 2rem auto;
}

.learning-paths-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 auto;
  justify-content: space-around;
  padding: 0 10px;
  gap: 24px 24px; /* 新增：横向和纵向间距 */
}

.learning-paths-grid .learning-path-card {
  width: 100%;
  margin-bottom: 0; /* 由 gap 控制间距，无需 margin-bottom */
  box-sizing: border-box;
}

@media (min-width: 600px) {
  .learning-paths-grid .learning-path-card {
    width: calc(48% - 12px); /* 适配 gap */
  }
}

@media (min-width: 900px) {
  .learning-paths-grid .learning-path-card {
    width: calc(32% - 16px); /* 适配 gap */
  }
}

.learning-path-card {
  background-color: #fff;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-decoration: none;
  color: var(--color-text-dark);
  transition: box-shadow 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1);
  border: 1.5px solid #e0e0e0;
  cursor: pointer;
  margin-bottom: 25px;
  width: 100%;
  flex: 1 0 300px;
  min-height: 100px;
}

.learning-path-card:hover {
  transform: translateY(-6px) scale(1.025);
  box-shadow: 0 12px 32px rgba(66, 184, 131, 0.13);
  border-color: #b2e5d6;
}

.card-icon {
  font-size: 2em;
  color: var(--color-primary);
  margin-bottom: 15px;
  margin-right: 0;
  width: 100%;
  text-align: center;
}

.card-content {
  margin-bottom: 20px;
  width: 100%;
}

.card-content h3 {
  margin: 0 0 8px;
  font-size: 1.2em;
  font-weight: 600;
}

.card-content p {
  margin: 0;
  font-size: 0.9em;
  color: var(--color-text-light);
  line-height: 1.5;
}

.card-arrow {
  margin-top: auto;
  text-align: right;
  font-size: 1.2em;
  color: var(--color-primary);
}

.timeline-children {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out, padding-bottom 0.3s ease-out;
  margin-top: 15px;
  padding-bottom: 0;
  width: 100%;
}

.timeline-children.open {
  max-height: 1000px;
  padding-bottom: 20px;
}

.timeline-children-level-2 {
  padding-left: 15px;
  border-left: 1px solid #eee;
  margin-left: 10px;
}

.timeline-children .timeline-card {
  display: block;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
  background-color: #f0f0f0;
  color: var(--color-text-dark);
  text-decoration: none;
  font-size: 0.95em;
  border: 1px solid #ddd;
  width: calc(100% - 20px);
  box-sizing: border-box;
}

.timeline-children .timeline-card:hover {
  background-color: #e0e0e0;
}

.timeline-children  .timeline-card h4{
  font-size: 1em;
  margin: 0;
  font-weight: 600;
}

/* Masonry Layout Styles */
.learning-paths-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 auto;
  justify-content: space-around;
  padding: 0 10px;
}

.learning-paths-grid .learning-path-card {
  width: 100%;
  margin-bottom: 0; /* 由 gap 控制间距，无需 margin-bottom */
  box-sizing: border-box;
}

@media (min-width: 600px) {
  .learning-paths-grid .learning-path-card {
    width: calc(48% - 12px); /* 适配 gap */
  }
}

@media (min-width: 900px) {
  .learning-paths-grid .learning-path-card {
    width: calc(32% - 16px); /* 适配 gap */
  }
}
/* End Masonry Layout Styles */
</style>
