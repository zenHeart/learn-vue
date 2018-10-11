<template>
<Parent></Parent>
</template>

<script>
const defaultTheme = {
    
}

import Parent from './Parent.vue';

export default {
    name: 'provide-inject',
    data:function(){
        return {
            btnDefaultClass: 'primary'
        }
    },
    provide:function() {
        return {
            btnDefaultClass:this.btnDefaultClass
        }
    },
    components: {
        Parent
    }
}
</script>

<style lang="less">
.primary {
    background: blue;
}
</style>
