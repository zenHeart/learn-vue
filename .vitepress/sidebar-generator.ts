import fs from 'fs'
import path from 'path'
import type { Config as ThemeConfig } from '@vue/theme'

/**
 * 根据学习路径目录结构自动生成侧边栏配置
 * @param basePath 基础路径
 * @param ignorePaths 忽略的路径
 * @returns 侧边栏配置对象
 */
export function generateLearningPathSidebar(
  basePath: string = path.resolve(__dirname, '../src/learning-path'),
  ignorePaths: string[] = ['node_modules']
): ThemeConfig['sidebar'] {
  // 基础侧边栏总是显示概述
  const sidebar: ThemeConfig['sidebar']  = {
    '/learning-path/': [
      {
        text: 'Vue 学习路径',
        items: [{ text: '概述', link: '/learning-path/' }]
      }
    ]
  }

  // 读取学习路径根目录下的所有文件夹
  try {
    const pathDirs = fs
      .readdirSync(basePath, { withFileTypes: true })
      .filter(
        (dirent) =>
          dirent.isDirectory() &&
          !ignorePaths.includes(dirent.name) &&
          !dirent.name.startsWith('.')
      )
      .map((dirent) => dirent.name)

    // 按编号排序学习路径文件夹（如果有编号）
    const sortedPathDirs = [...pathDirs].sort((a, b) => {
      // 尝试提取编号
      const aMatch = a.match(/^(\d+)\./)
      const bMatch = b.match(/^(\d+)\./)
      
      // 如果两个都有编号，按编号排序
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1])
      }
      // 如果只有一个有编号，有编号的排前面
      if (aMatch) return -1
      if (bMatch) return 1
      // 否则按字母顺序排序
      return a.localeCompare(b)
    })
    
    // 处理每个学习路径文件夹
    for (const dir of sortedPathDirs) {
      const dirPath = path.join(basePath, dir)
      const dirItems = []

      // 检查是否有学习目录
      const hasSrcDir = fs.existsSync(path.join(dirPath, 'src'))
      if (hasSrcDir) {
        // 1. 添加概述页面
        if (fs.existsSync(path.join(dirPath, 'index.md'))) {
          dirItems.push({
            text: '学习路径主页',
            link: `/learning-path/${dir}/`
          })
        }

        // 2. 处理src目录中的步骤
        try {
          const srcPath = path.join(dirPath, 'src')
          const steps = fs
            .readdirSync(srcPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name)
            .sort((a, b) =>
              a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: 'base'
              })
            )

          // 为每个步骤添加一个条目
          for (const step of steps) {
            // 提取步骤标题，格式通常是 "xx.name"
            const stepParts = step.split('.')
            let title = step
            if (stepParts.length > 1) {
              // 如果格式是 "01.name"，就提取名称部分并转为标题格式
              title = stepParts.slice(1).join('.').replace(/-/g, ' ')
              // 首字母大写
              title = title.charAt(0).toUpperCase() + title.slice(1)
            }

            dirItems.push({
              text: `${stepParts[0]}. ${title}`,
              link: `/learning-path/${dir}/learning#${step}`
            })
          }
        } catch (err) {
          console.error(
            `Error processing src directory in ${dirPath}:`,
            err
          )
        }

        // 将此路径的条目添加到侧边栏
        if (dirItems.length > 0) {
          // 转换路径名称为更友好的格式
          const displayName = dir
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          sidebar['/learning-path/'].push({
            text: displayName,
            items: dirItems
          })
        }
      }
    }
  } catch (err) {
    console.error('Error generating learning path sidebar:', err)
  }

  return sidebar
}

/**
 * 根据 docs 目录结构自动生成侧边栏配置
 * @param basePath 基础路径
 * @param ignorePaths 忽略的路径
 * @returns 侧边栏配置对象
 */
export function generateDocsSidebar(
  basePath: string = path.resolve(__dirname, '../src/docs'),
  ignorePaths: string[] = ['node_modules']
): ThemeConfig['sidebar'] {
  const sidebar: ThemeConfig['sidebar'] = {
    '/docs/': []
  }

  // 读取 docs 根目录下的所有文件夹
  try {
    const pathDirs = fs
      .readdirSync(basePath, { withFileTypes: true })
      .filter(
        (dirent) =>
          dirent.isDirectory() &&
          !ignorePaths.includes(dirent.name) &&
          !dirent.name.startsWith('.')
      )
      .map((dirent) => dirent.name)
      .sort() // 按字母顺序排序文件夹

    // 处理每个文档目录
    for (const dir of pathDirs) {
      const dirPath = path.join(basePath, dir)
      const dirFiles = []

      try {
        // 读取目录中的所有 markdown 文件
        const files = fs
          .readdirSync(dirPath, { withFileTypes: true })
          .filter(dirent => {
            const name = dirent.name
            return !dirent.isDirectory() && 
                  (name.endsWith('.md') || name.endsWith('.mdx') || name === 'index.md')
          })
          .map(dirent => dirent.name)
          .sort() // 按文件名排序

        // 处理索引文件（如果存在）
        const indexFile = files.find(file => file === 'index.md')
        if (indexFile) {
          dirFiles.push({
            text: 'overview',
            link: `/docs/${dir}/`
          })
          // 从列表中移除 index.md，避免重复
          files.splice(files.indexOf(indexFile), 1)
        }

        // 处理其他文件
        for (const file of files) {
          // 获取文件名，去掉扩展名
          const fileName = file.replace(/\.(md|mdx)$/, '')
          // 将文件名首字母大写
          const displayName = fileName
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')

          dirFiles.push({
            text: fileName, // 保持原始文件名作为导航
            link: `/docs/${dir}/${fileName}`
          })
        }

        // 如果有文件，添加到侧边栏
        if (dirFiles.length > 0) {
          // 将目录名首字母大写
          const displayName = dir.charAt(0).toUpperCase() + dir.slice(1)
          
          // 检查是否有重复项，并移除它们
          const uniqueFiles = []
          const linkMap = new Set()
          
          for (const file of dirFiles) {
            if (!linkMap.has(file.link)) {
              linkMap.add(file.link)
              uniqueFiles.push(file)
            }
          }
          
          sidebar['/docs/'].push({
            text: displayName,
            items: uniqueFiles
          })
        }
      } catch (err) {
        console.error(`Error processing directory ${dirPath}:`, err)
      }
    }
  } catch (err) {
    console.error('Error generating docs sidebar:', err)
  }

  return sidebar
}

/**
 * 合并多个侧边栏配置
 * @param sidebars 多个侧边栏配置
 * @returns 合并后的侧边栏配置
 */
export function mergeSidebars(...sidebars: ThemeConfig['sidebar'][]): ThemeConfig['sidebar'] {
  const mergedSidebar: ThemeConfig['sidebar'] = {}

  // 合并所有侧边栏
  for (const sidebar of sidebars) {
    if (!sidebar) continue

    // 将每个路径的侧边栏合并
    for (const [path, items] of Object.entries(sidebar)) {
      if (!mergedSidebar[path]) {
        mergedSidebar[path] = []
      }
      
      // 如果当前路径已存在，将新项添加到现有列表中
      if (Array.isArray(items) && Array.isArray(mergedSidebar[path])) {
        (mergedSidebar[path] as any[]).push(...items)
      }
    }
  }

  return mergedSidebar
}


