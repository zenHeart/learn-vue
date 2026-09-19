# Vue 踩坑专题

别人 5 小时排查出来的坑，你 5 分钟绕过。每条都给出「错误模式 + 修复版本」对照，关键时点击 REPL 切换观察差异。

## 分类索引

| 类别 | 关注点 | 代表 demo |
|------|--------|-----------|
| 响应式 | 解构失效、computed 副作用、deep 追踪过广 | `01`, `02`, `03` |
| 异步 / Suspense | async setup 必须包 Suspense | `04` |
| 路由 | 异步组件路径白屏 | `05` |
| 模板 / DOM | 模板 ref 拿不到值 | `06` |
| 依赖注入 | inject 默认值非响应 | `07` |
| 测试 | store 跨用例状态污染 | `08` |
| 集合响应式 | 数组索引的引用问题 | `09` |
| SSR / 浏览器 API | 服务端访问 window 报错 | `10` |

## Demo 列表

1. [响应式丢失](./src/01.reactivity-loss/) — 解构后失效
2. [computed 副作用](./src/02.computed-side-effect/) — getter 内修改状态死循环
3. [watch deep 过度触发](./src/03.watch-deep-overfire/) — 整树追踪代价
4. [async setup 与 Suspense](./src/04.async-setup-and-suspense/) — fallback 不触发
5. [路由懒加载白屏](./src/05.router-async-resolve/) — 字符串引用 vs 动态 import
6. [模板 ref undefined](./src/06.template-ref-undefined/) — useTemplateRef 修复
7. [provide/inject 默认值](./src/07.provide-inject-default/) — ref 包裹才能响应
8. [Pinia 测试隔离](./src/08.pinia-store-cross-test/) — setActivePinia 修复
9. [响应式数组索引](./src/09.reactive-array-index/) — ref 包装数组的引用语义
10. [SSR 访问 window](./src/10.ssr-window-undefined/) — onMounted 守卫

## 验证方式

- 在 REPL 切换错误 / 修复版本观察行为差异
- 看 Vue 官方文档对应 API
- 用 Vue DevTools 跟踪依赖关系
