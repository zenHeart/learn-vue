<script setup>
const nav = [
  { text: 'Docs', activeMatch: '^/docs/', link: '/docs/' },
  { text: 'Learning Path', activeMatch: '^/learning-path/', link: '/learning-path/' },
]

const sidebar = [
  { text: '工具', items: [{ text: 'Vite', link: '/docs/tools/vite' }] },
  { text: '生态', items: [{ text: 'VueUse', link: '/docs/tools/vueuse' }] },
]

const themeEntry = [
  "import DefaultTheme from 'vitepress/theme'",
  "import MyGlobalComp from './components/MyGlobalComp.vue'",
  '',
  'export default {',
  '  extends: DefaultTheme,',
  '  enhanceApp({ app }) {',
  '    app.component(\'MyGlobalComp\', MyGlobalComp)',
  '  }',
  '}',
].join('\n')
</script>

<template>
  <div class="vp">
    <header class="vp-nav">
      <span v-for="n in nav" :key="n.text" class="nav-item">{{ n.text }}</span>
    </header>

    <div class="vp-body">
      <aside class="vp-sidebar">
        <div v-for="g in sidebar" :key="g.text" class="group">
          <div class="group-title">{{ g.text }}</div>
          <a v-for="i in g.items" :key="i.link" class="item">{{ i.text }}</a>
        </div>
      </aside>

      <main class="vp-main">
        <h2>VitePress 自定义主题预览</h2>
        <p class="hint">VitePress 本体是构建时工具，REPL 里只能看产物的样子。</p>

        <h3>theme/index.ts</h3>
        <pre>{{ themeEntry }}</pre>
      </main>
    </div>
  </div>
</template>

<style scoped>
.vp { font-family: system-ui, sans-serif; color: #213547; max-width: 720px; margin: 0 auto; }
.vp-nav { display: flex; gap: 16px; padding: 10px 16px; border-bottom: 1px solid #eee; background: #fff; }
.nav-item { font-size: 0.9rem; color: #2c3e50; }
.vp-body { display: grid; grid-template-columns: 180px 1fr; min-height: 280px; }
.vp-sidebar { background: #fafbfc; border-right: 1px solid #eee; padding: 12px 8px; font-size: 0.85rem; }
.group + .group { margin-top: 14px; }
.group-title { font-weight: 600; color: #888; padding: 4px 8px; font-size: 0.78rem; text-transform: uppercase; }
.item { display: block; padding: 4px 10px; border-radius: 4px; color: #213547; cursor: pointer; }
.item:hover { background: #e6f4ff; }
.vp-main { padding: 16px 24px; }
.vp-main h2 { font-size: 1.1rem; margin: 0 0 6px; }
.vp-main h3 { font-size: 0.92rem; margin: 14px 0 6px; }
.hint { font-size: 0.82rem; color: #666; margin: 0 0 10px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 0.78rem; overflow-x: auto; line-height: 1.55; }
</style>
