<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import type { DefaultTheme } from 'vitepress';
import LeaningTopic from './LeaningTopic.vue'; // 确保路径正确

interface SidebarItem {
  text?: string;
  title?: string;
  link?: string;
  items?: SidebarItem[];
}

const { theme } = useData();

const groups = computed(() => {
  const sidebar = theme.value.sidebar as DefaultTheme.Sidebar;
  let items: SidebarItem[] = [];
  if (sidebar && typeof sidebar === 'object' && !Array.isArray(sidebar) && sidebar['/learning-path/']) {
    items = sidebar['/learning-path/'] as SidebarItem[];
  } else if (Array.isArray(sidebar)) {
    items = sidebar as SidebarItem[];
  }
  return items.filter(item => item.items && (item.text || item.title));
});
</script>

<template>
  <div class="home-container">
    <main>
      <header class="page-header">
        <h1 class="hero-title">
          <span class="vue-gradient">Vue</span> Learning Path
        </h1>
        <p class="hero-desc">
          一张图梳理 Vue 知识体系，点击节点开启你的学习之旅
        </p>
      </header>
      <section class="learning-paths-grid">
        <LeaningTopic :sidebar="groups" />
      </section>
    </main>

    <footer style="text-align: center; padding: 20px; color: var(--color-text-light); font-size: 0.9em;">
      &copy; 2025 Vue Learning Path. All rights reserved.
    </footer>
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
  justify-content: center;
  width: 100%;
  padding: 0 20px;
}
</style>
