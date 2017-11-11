---
title: vue-source    
tags: http vue      
birth: 2017-11-07      
modified: 2017-11-07      
---

vue-source
===
**前言:vue http 封装**

---

## 概述


## 基本使用
参见范例 [基本使用](http_basic.html) 
1. 应用 `vue-resource` 库
2. 采用 `Vue.http` 或 `this.$http` 调用,返回对象为 promise 类型

注意使用前,在该文件对应的目录执行
```bash
# 开启 http-server 
http-server -p 8081
```

访问 [http_basic.html](http://localhost:8081/http_basic.html) 即可.

如果没有安装 `http-server` 方法如下:
```bash
# 安装该工具,用来仿真 http 服务器
npm i -g http-server 
```

