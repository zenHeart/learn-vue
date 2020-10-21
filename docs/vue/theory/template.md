# template

## 基本流程
1. 拿到模板数据 `template`
2. 调用 `compile(template, options)` 转换
   1. `parser(template, options)` 返回 dom ast 树
      1. 按照标签节点递归解析
      2. 节点内按照键值对逐一解析原生和自定义属性
   2. `generate(ast, state)` ast 树 -> render 函数字符串
   3. `createFunction(compiled.render, fnGenErrors)` 将字符串函数编译为匿名渲染函数