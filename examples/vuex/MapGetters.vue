<template>
    <div>
        <h1>完成的任务: {{doneTodosCount}}</h1>
        <ul>
            <li v-for = "item in todos">
                <p><strong>id :{{item.id}}</strong> <span>{{item.text}}</span>
                    <input type="checkbox" v-model="item.done" v-on:click="item.done^=1" />
                </p>
            </li>
        </ul>
    </div>
</template>
<script>
    //导入缓存控制中对动态属性的映射
    import {mapGetters,mapState} from 'vuex'

    //mapState 的作用可以理解为将 this 的环境转换到了 store 中
    export default {
        computed:{
            ...mapState([ //若属性同名使用数组模式罗列属性名即可
                    'todos'
                ]
            )
            ,...mapGetters([
                'doneTodosCount'
            ])}
    }
</script>
<style scoped>
    ul li {
        list-style:none
    }
</style>
