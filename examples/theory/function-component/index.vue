<template >
    <div>
        <h3>函数式组件,利用父级作用域传递参数</h3>
        <Func></Func>
    </div>
</template>

<script>
    import Func from './func.vue';

    export default {
        name:'FunctionComponent',
        components:{
            Func
        },
        data:function() {
            return {
                demo:'自动继承父类的 data 值'
            }
        }

    }
</script>

<style scoped>

</style>