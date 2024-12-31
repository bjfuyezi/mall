import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';

Vue.use(ElementUI)

// 将 axios 挂载到 Vue 原型上
Vue.prototype.$axios = axios

// 或者设置为全局变量
window.axios = axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
