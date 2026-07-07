# 指令


## v-for 和 v-if 不能一起使用
模板 

```vue
<div v-for="item in arr" v-if="arr.lenght">{{ item }}</div>
<h1 v-else>empty</h1>
```

转换为类似如下效果

```js
{
  render(h) {
    return arr.map((item, index) => {
      return arr.length ? h('div',_v(item)):h('h1',_v('empty'))
    })
  }
}
```