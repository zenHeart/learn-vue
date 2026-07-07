import Vue from 'vue'
import App from './app'
import VueCompositionAPI from '@vue/composition-api'

Vue.use(VueCompositionAPI)

window.app = new Vue({
  el: '#app',
  render: (h) => h(App),
})