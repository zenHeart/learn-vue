import Vue from 'vue'
import Router from 'vue-router'
import Foo from '@/components/foo'
import Bar from '@/components/bar'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Foo
    }, { path: '/foo', component: Foo },
    { path: '/bar', component: Bar }
  ]
})
