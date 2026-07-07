import fs from 'fs'
import path from 'path'
import { createMarkdownRenderer } from 'vitepress'
import { ExampleData } from '@theme/components/Vue3Repl/utils'

export function createLearningPathData(pathName: string) {
  return {
    watch: `./src/**`,
    async load() {
      const md = await createMarkdownRenderer(process.cwd(), {
        theme: 'github-dark',
      }, '/')
      const srcDir = path.resolve(__dirname, `./${pathName}/src`)
      
      if (!fs.existsSync(srcDir)) {
        console.warn(`Learning path src directory not found: ${srcDir}`)
        return {}
      }
      
      const files = readExamples(srcDir)
      
      // 处理 Markdown 内容
      for (const step in files) {
        const stepFiles = files[step]
        const desc = stepFiles['description.md'] as string
        if (desc) {
          stepFiles['description.md'] = md.render(desc)
        }

        // 处理 _meta.js
        const metaInfo = stepFiles['_meta.js'] as string
        if (metaInfo) {
          try {
            // 使用 Vite 的内置能力动态加载 _meta.js 文件
            // 这里假设 stepFiles['_meta.js'] 是文件路径
            const metaPath = path.join(srcDir, step, '_meta.js')
            if (fs.existsSync(metaPath)) {
              // 动态导入 _meta.js
              const metaModule = await import(metaPath)
              // 复制 _meta.js 为解析后的对象
              stepFiles['_meta.js'] = metaModule.default || metaModule
            }
          } catch (e) {
            console.warn(`Failed to parse _meta.js with Vite: ${e}`)
          }
        }
      }
      
      return files
    }
  }
}

export function readExamples(srcDir: string): Record<string, ExampleData> {
  const examples = fs.readdirSync(srcDir)
  const data: Record<string, ExampleData> = {}
  for (const name of examples) {
    data[name] = readExample(path.join(srcDir, name))
  }
  return data
}

function readExample(dir: string): ExampleData {
  const filenames = fs.readdirSync(dir)
  const files: ExampleData = {}
  
  for (const filename of filenames) {
    const fullPath = path.join(dir, filename)
    if (fs.statSync(fullPath).isDirectory()) {
      if (filename === '_hint') {
        files[filename] = readExample(fullPath)
      } else {
        files[filename] = readComponentDir(fullPath)
      }
    } else {
      files[filename] = fs.readFileSync(fullPath, 'utf-8')
    }
  }

  // fallback so that we can omit identical files in _hint
  if (files._hint) {
    for (const filename in files) {
      if (filename !== '_hint') {
        let hint = files._hint[filename]
        if (!hint) {
          hint = files._hint[filename] = {}
        }
        const original = files[filename]
        if (typeof original !== 'string' && typeof hint !== 'string') {
          for (const key in original) {
            if (!(key in hint)) {
              hint[key] = original[key]
            }
          }
        }
      }
    }
  }

  return files
}

function readComponentDir(dir: string): Record<string, string> {
  const files = fs.readdirSync(dir)
  const ret: Record<string, string> = {}
  for (const file of files) {
    const fullPath = path.join(dir, file)
    ret[file] = fs.readFileSync(fullPath, 'utf-8')
  }
  return ret
}
