<template>
    <div>
        <p>测试自定义指令 focus</p>
        <input type="text" v-focus>
         <p>测试采用 Vue.directive 定义全局指令</p>
        <input type="text" v-init="test">
    </div>
</template>
<script>
    import focus from './focus'
    import gFocus from './global-init'

    export default {
        directives: {
            focus
        }
    }
</script>