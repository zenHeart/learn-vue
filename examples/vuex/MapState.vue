<template>
    <div>
        <p>countAlias1 : {{countAlias1}}</p>
        <p>countAlias2 : {{countAlias2}}</p>
        <p>countAlias3 : {{countAlias3}}</p>
        <p>selfCount : {{selfCount}}</p>
        <p>count : {{count}}</p>
    </div>
</template>
<script>
    //导入映射函数
    import {mapState} from 'vuex'

    //mapState 的作用可以理解为将 this 的环境转换到了 store 中
    export default {
        computed: {
            selfCount() {
                return this.$store.state.count;
            }, ...mapState({ //结合对象展开语法即可实现原局部计算属性和状态属性混写
                //直接在其中引用 state 对象
                countAlias1: state => state.count,
                countAlias2: 'count',//等同于上例
                countAlias3(state) {
                    //为了实现对对本地 this 的引用
                    return 'self count ' + state.count;
                }
            }), ...mapState([ //若属性同名使用数组模式罗列属性名即可
                    'count'
                ]
            )
        }
    }
</script>
