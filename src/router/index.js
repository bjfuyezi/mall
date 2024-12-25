import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/new',
    name: 'new',
    component: () => import('../views/NewView.vue')
  },
  {
    path: '/hot',
    name: 'hot',
    component: () => import('../views/HotView.vue')
  },
  {
    path: '/promotion',
    name: 'promotion',
    component: () => import('../views/PromotionView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../views/CartView.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
