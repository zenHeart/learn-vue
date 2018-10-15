<template>
    <div>
        <h1>测试模块映射</h1>
        <p><button @click="login({name:'tom'})">login</button></p>
        <p><button @click="logout">logout</button></p>
    </div>
</template>
<script>
//导入缓存控制中对动态属性的映射
import { mapActions } from "vuex";
import { EVENTS } from "./modules/user";

//mapState 的作用可以理解为将 this 的环境转换到了 store 中
export default {
  methods: {
    ...mapActions([EVENTS.LOGIN, EVENTS.LOGOUT])
  }
};
</script>
<style scoped>
ul li {
  list-style: none;
}
</style>
