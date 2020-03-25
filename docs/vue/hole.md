---
title: hole    
tags: vue hole      
birth: 2017-10-10      
modified: 2017-10-10      
---

hole
===
**前言:记录在学习 vue 中踩过的所有的坑**

---

### 2017-10-10

> Component template should contain exactly one root element.

在编写模板时最好包含根元素否则会产生此警告

```js
//合法模板有根元素
const fooTemp = {
        template: '<div>children router Home</div>'
    };

//警告模板没有根元素
const barTemp = {
        template: '<h1>warn</h1>' +
         '<div>children router Home</div>'
    };
```






