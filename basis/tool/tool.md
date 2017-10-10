tool
===
**前言:讲解使用 vue 时用到的工具**

---

# 单文件打包
参考 [webpack-simple](https://github.com/vuejs-templates/webpack-simple)

使用流程

```bash
npm install -g vue-cli 
vue init webpack-simple
cd my-project
npm install
npm run dev
```

## .vue 文件组织

每个文件由三部分组成

* template 标签
    * 包含 HTML 标签的组件
    * 每个 vue 只包含一个模板标签
    * 内容将作为字符串编译到模板选项
    * 支持导入 html 模板
    * 支持使用 [jade](https://www.npmjs.com/package/jade) 模板
    
* script 标签
    * 包含 js 文件
    * 每个 vue 文件只能包含一个脚本标签
    * 支持导入 js 文件
* style 标签
    * 直接书写原生 css
    * 可包含多个 style 标签
    * 使用 lang 属性定义预编译语言,例如 sass
    * 支持导入 css 文件
    

此外还可添加自定义块

* 自定义标签内容
* 注释使用 html  `<!-- -->` 格式

## vue-loader
是基于 Webpack 的 loader.用于转换 vue 组件.

