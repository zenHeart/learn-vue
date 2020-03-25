<template>
	<div>
		<h1>测试循环数字</h1>
		<p v-for="i in level" :key="i">循环数字 {{i}}</p>
	</div>
</template>

<script>
export default {
    data() {
        return {
            level: 5,
        }
    },
}
</script>
