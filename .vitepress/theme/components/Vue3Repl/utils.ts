import { onBeforeUnmount } from 'vue'

export type ExampleData = {
  [key: string]: string | Record<string, string>
} & {
  'import-map.json'?: string
  _hint?: ExampleData
}

export function onHashChange(cb: () => void) {
  window.addEventListener('hashchange', cb)
  onBeforeUnmount(() => {
    window.removeEventListener('hashchange', cb)
  })
}

// 新增函数：读取学习路径数据
export async function loadLearningPathData(path: string) {
  try {
    const module = await import(`./${path}/learning-path-${path}.data`)
    return module.data
  } catch (error) {
    console.error(`Failed to load data for path: ${path}`, error)
    return {}
  }
}
