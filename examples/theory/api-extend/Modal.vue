<template>
    <div v-show="showFlag">这是一个模态框</div>
</template>

<script>
    export default {
        data:function() {
            return {
                showFlag:true
            }
        }
    }
</script>
