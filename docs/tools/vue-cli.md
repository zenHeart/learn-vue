---
title: vue-cli    
tags: vue-cli      
birth: 2017-11-04      
modified: 2017-11-04      
---

vue-cli
===
**前言:讲解基于 vue-cli 的构建方式**

---

## 快速入门
安装 `vue-cli`

```bash
# 若出现安装失败使用 sudo 模式安装
npm i -g vue-cli 
```

初始化项目

```bash
# 初始化项目
vue init webpack vue-demo 
```

运行项目

```bash
cd vue-demo
npm install
npm run dev
```

详见 [vue-cli](https://github.com/vuejs/vue-cli)

如果希望静态访问,直接使用 `npm run build` 编译文件即可.


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

