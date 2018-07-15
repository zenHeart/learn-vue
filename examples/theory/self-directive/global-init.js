import Vue from 'vue'

Vue.directive('init',{
    inserted:(el,binding) => {
        el.value = binding.expression;
    }
})