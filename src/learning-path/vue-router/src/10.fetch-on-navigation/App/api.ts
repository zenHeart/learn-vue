// 模拟一个数据源：返回文章 + 延迟
export interface Article {
  id: number
  title: string
  body: string
}

export async function fetchArticle(id: number | string): Promise<Article> {
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 200))
  return {
    id: Number(id),
    title: `文章 #${id}`,
    body: `这是文章 ${id} 的正文。内容包含若干段落…`,
  }
}