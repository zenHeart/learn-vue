# 指令


## v-for 和 v-if 不能一起使用
模板 

```vue
<div v-for="item in arr" v-if="arr.lenght"/>
<div v-else>empty</div>
```

转换为类似如下效果

```vue
<div v-for="item in arr">

</div>
<div v-else>empty</div>
```