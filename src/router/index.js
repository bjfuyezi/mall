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
  },
  {
    path: '/user/review',
    name: 'user-review',
    component: () => import('../views/usermodel/UserComment.vue')
  },
  {
    path: '/shopmodel/asshop',
    name: 'shop-asshop',
    component: () => import('../views/shopmodel/AsshopView.vue')
  },
  {
    path: '/shopmodel/info',
    name: 'shop-info',
    component: () => import('../views/shopmodel/ShopInfoView.vue')
  },
  {
    path: '/shopmodel/productManage',
    name: 'product-management',
    component: () => import('../views/shopmodel/ProductManagementView.vue')
  },
  {
    path: '/shopmodel/promotionManage',
    name: 'promotion-management',
    component: () => import('../views/shopmodel/AdManagement.vue')
  },
  {
    path: '/shopmodel/couponManage',
    name: 'coupon-management',
    component: () => import('../views/shopmodel/CouponManagementView.vue')
  },
  {
    path: '/shopmodel/shopManage',
    name: 'shop-management',
    component: () => import('../views/shopmodel/ShopManagementView.vue')
  },
  {
    path: '/user/center',
    name: 'user-center',
    component: () => import('@/views/UserCenter.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/profile',
    name: 'user-profile',
    component: () => import('@/views/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/address',
    name: 'user-address',
    component: () => import('@/views/UserAddress.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ad',
    name: 'AdManageMent',
    component: () => import('../views/shopmodel/AdManagement.vue')
  },
  {
    path: '/shopmodel/addProduct',
    name: 'addProduct',
    component: () => import('../views/shopmodel/AddProduct.vue')
  },
  {
    path: '/forget-password',
    name: 'forget-password',
    component: () => import('../views/ForgetPasswordView.vue')
  }
]

const router = new VueRouter({
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const store = router.app.$store;
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    if (!store.getters.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router
