<template>
<div>
    <h1>测试采用 render 函数进行组件渲染</h1>
    <RenderH :level="level">test render h</RenderH>
    <RenderH :level="2">test render h</RenderH>
    <RenderH :level="3">test render h</RenderH>
    <RenderH :level="4">test render h</RenderH>
</div>
</template>

<script>
import RenderH from './RenderH.vue';

export default {
    name: 'Render',
    components: {
        RenderH
    },
    data: function () {
        return {
            level: 2
        }
    }
}
</script>
