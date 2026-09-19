// 模拟一个会失败的网络请求
export interface User {
  id: number
  name: string
}

export async function fetchUser(id: number, shouldFail = false): Promise<User> {
  await new Promise((r) => setTimeout(r, 250))
  if (shouldFail) throw new Error(`fetchUser(${id}) failed`)
  return { id, name: `User #${id}` }
}