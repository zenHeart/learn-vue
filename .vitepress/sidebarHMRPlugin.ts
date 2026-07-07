import type { Plugin } from 'vitepress'
import path from 'path'
import fs from 'fs'

export default function sidebarHMRPlugin(): Plugin {
  return {
    name: 'vitepress-sidebar-hmr',
    apply: 'serve',
    configureServer(server) {
      const srcDir = path.resolve(__dirname, '../src')
      const configPath = path.resolve(__dirname, './config.ts')
      server.watcher.add(srcDir)
      server.watcher.on('all', (event, file) => {
        if (file.startsWith(srcDir)) {
          // 更新 config.ts 的 mtime，触发 VitePress 重新加载配置
          try {
            const now = new Date()
            fs.utimesSync(configPath, now, now)
          } catch (e) {
            // fallback: append a comment
            fs.appendFileSync(configPath, '\n// sidebar auto update\n')
          }
        }
      })
    }
  }
}