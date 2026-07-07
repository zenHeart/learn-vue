import conditionalCompilerAliasPlugin from './conditionalCompilerAliasPlugin'
import sidebarHMRPlugin from './sidebarHMRPlugin'
import { defineConfig } from 'vitepress'
import type { Config as ThemeConfig } from '@vue/theme'
import {
  generateLearningPathSidebar,
  generateDocsSidebar,
  mergeSidebars
} from './sidebar-generator'

const nav: ThemeConfig['nav'] = [
  {
    text: 'Docs',
    activeMatch: `^/docs/`,
    link: '/docs/'
  },
  {
    text: 'Learning Path',
    activeMatch: `^/learning-path/`,
    link: '/learning-path/'
  }
]

export default defineConfig({
  title: 'Vue Learning Path',
  ignoreDeadLinks: true,
  sitemap: {
    hostname: 'https://vue.zenheart.site/'
  },
  lang: 'en-US',
  description: 'Deep Learn Vue Note',
  srcDir: 'src',
  srcExclude: ['learning-path/**/description.md'],
  themeConfig: {
    nav,
    sidebar: mergeSidebars(
      generateLearningPathSidebar(),
      generateDocsSidebar()
    ),
    socialLinks: [
      { icon: 'github', link: 'https://github.com/zenHeart/learn-vue' },
      { icon: 'twitter', link: 'https://x.com/zenheartCL' }
    ],

    footer: {
      copyright: `Copyright © 2014-${new Date().getFullYear()} Zenheart`
    }
  },
  vite: {
    plugins: [conditionalCompilerAliasPlugin(), sidebarHMRPlugin()],
    optimizeDeps: {
      exclude: ['vue-for-vue2-repl', 'vue2-repl']
    }
  }
})
