<template>
<button :class="type">
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: "ZenButton",
    inject: ["btnDefaultClass"],
    created: function () {
        console.log(this);
    },
    props: {
        type: {
            type: String,
            default () {
                return this.btnDefaultClass;
            }
        }
    }
};
</script>
