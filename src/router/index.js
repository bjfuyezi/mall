import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductView from '../views/ProductView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'HomeView',
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
  },
  {
    path: '/product/:id',
    name: 'product',
    component: ProductView
  },
  {
    path: '/order/confirm',
    name: 'order-confirm',
    component: () => import('../views/OrderConfirmView.vue')
  },
  {
    path: '/order/success',
    name: 'order-success',
    component: () => import('../views/OrderSuccessView.vue')
  },
  {
    path: '/user/orders',
    name: 'user-orders',
    component: () => import('../views/usermodel/UserOrdersView.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
