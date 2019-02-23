import Vue from 'vue';

Vue.directive('isEllipse', function (el, binding,vnode) {
    vnode.context.isEllipse =el.offsetWidth < el.scrollWidth
})


