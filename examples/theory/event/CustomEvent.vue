<template>
    <div>
        <h3>测试自定义事件抛出的内容,自定义事件不会携带原生 $event 内容</h3>
        <button @click="emitEvent">抛出事件</button>
    </div>
</template>

<script>
    export default {
        name:'CustomEvent',
        methods:{
            emitEvent() {
                console.log('原生事件内容:',arguments);
                this.$emit('custom');
            }
        }
    }
</script>

<style scoped>

</style>