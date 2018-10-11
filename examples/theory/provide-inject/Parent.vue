<template>
<div>
    <h1>按钮深度赋值</h1>
    <ZenButton>
        <template>
            demo
        </template>
    </ZenButton>
</div>
</template>

<script>
import ZenButton from './Button.vue';

export default {
    name: "Parent",
    components: {
        ZenButton
    }
}
</script>
