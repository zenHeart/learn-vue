<template>
    <button @click="show">点击触发混入方法</button>
</template>

<script>
    import mixin from './mixin'
    export default {
        mixins:[mixin],
        data() {
            return {
                a:'覆盖混入的熟悉 a',
                f:1
            }
        }
    }
</script>