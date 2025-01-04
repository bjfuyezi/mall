import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import axios from 'axios'

Vue.use(ElementUI)

Vue.prototype.$axios = axios
window.axios = axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
