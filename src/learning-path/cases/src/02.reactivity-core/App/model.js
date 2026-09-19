// 起点：尚未连接属性读写与订阅者。先让第一条依赖测试通过。
export function reactive(target) { return target; }
export function effect(fn) { fn(); return () => {}; }
export async function flush() {}
