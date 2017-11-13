<template>
    <div>
        count : {{count}}
        <p><button @click="mutation">突变 count 为 10</button></p>
        <p><button @click="cancelAllTodosAsync">mutations 值处理同步,cancelTodesDoneAsync 为异步无法触发</button></p>
        <p><button @click="cancelAllTodos">重制代办事项为 0,同步函数</button></p>
    </div>
</template>
<script>
export default {
    computed:{
        count(){
            return this.$store.state.count;
        }
    },
    methods:{
        mutation() {
            this.$store.commit({
                type:'mutation',
                count:10
            })
        },cancelAllTodosAsync() {
           //mutations 只能处理同步事件.该修改无法触发
          this.$store.commit('cancelTodesDoneAsync');
        },
        cancelAllTodos(){
            this.$store.commit('cancelTodesDone');
        }
    }
}
</script>
