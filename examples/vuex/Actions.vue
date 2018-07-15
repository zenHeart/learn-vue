<template>
    <div>
        <p>组件中使用 dispach 触发状态管理的异步动作 actions</p>
        <p><button @click="asyncIncrement">异步增加</button></p>
        <p><button @click="asyncAutoAddTwice">连续调用状态切换</button></p>
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
        //通过返回 promise 独享给分发处理
        asyncIncrement() {
           return this.$store.dispatch({
                type:'asyncIncrement'
            }).then(function () {
                console.log('递增成功!')
            }).catch(function (err) {
                alert(err.message);
            })
        },asyncAutoAddTwice() {
            return this.$store.dispatch({
                type:'actionA',
                count:1
            }).then(function () {
                alert('累加结束');
            })
        }
    }
}
</script>
