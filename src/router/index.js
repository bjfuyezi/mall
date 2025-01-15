import Vue from 'vue'
import VueRouter from 'vue-router'

// 引入视图组件
import HomeView from '../views/HomeView.vue'
import ProductView from '../views/ProductView.vue'
import AdminView from '../views/admin/AdminView.vue'
// import CouponManagement from '../views/admin/CouponManagement.vue'
import CouponManageView from "@/views/admin/CouponManageView.vue";
import UserManagement from '../views/admin/UserManagement.vue'

// 使用 VueRouter 插件
Vue.use(VueRouter)

// 定义路由规则,url路径、名字、组件
const routes = [
  // 主页路由
  {
    path: '/',
    name: 'HomeView',
    component: HomeView
  },
  // 新品推荐页
  {
    path: '/new',
    name: 'new',
    component: () => import('../views/NewView.vue')
  },
  // 热销商品页
  {
    path: '/hot',
    name: 'hot',
    component: () => import('../views/HotView.vue')
  },
  // 促销活动页
  {
    path: '/promotion',
    name: '平台优惠',
    component: () => import('../views/PromotionView.vue')
  },
  // 登录页
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  // 注册页
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue')
  },
  // 购物车页
  // {
  //   path: '/cart',
  //   name: 'cart',
  //   component: () => import('../views/CartView.vue')
  // },
  // 商品详情页，使用动态参数 `id`
  {
    path: '/product/:id',
    name: 'product',
    component: ProductView
  },
  // 订单确认页
  {
    path: '/order/confirm',
    name: 'order-confirm',
    component: () => import('../views/OrderConfirmView.vue')
  },
  // 订单成功页
  {
    path: '/order/success',
    name: 'order-success',
    component: () => import('../views/OrderSuccessView.vue')
  },
  // 用户订单页
  {
    path: '/user/orders',
    name: 'user-orders',
    component: () => import('../views/usermodel/UserOrdersView.vue')
  },
  // 用户评论页
  {
    path: '/user/review',
    name: 'user-review',
    component: () => import('../views/usermodel/UserComment.vue')
  },
  // 用户评论列表页
  {
    path: '/user/comments',
    name: 'user-comments',
    component: () => import('../views/usermodel/UserCommentList.vue')
  },
  // 店铺管理相关路由
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
    name: '店铺优惠券管理',
    component: () => import('../views/shopmodel/CouponManageView.vue')
  },
  {
    path: '/shopmodel/addPlatformCoupon',
    name: '加入平台券的适用范围',
    component: () => import('../views/shopmodel/AddPlatformCouponView.vue')
  },
  {
    path: '/shopmodel/shopManage',
    name: 'shop-management',
    component: () => import('../views/shopmodel/ShopManagementView.vue')
  },
  // 用户中心相关路由，需登录
  {
    path: '/user/center',
    name: 'user-center',
    component: () => import('@/views/UserCenter.vue'),
    meta: { requiresAuth: true } // 路由元信息：需要登录
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
  {//查看购物车
    path: '/user/cart',
    name: '我的购物车',
    component: () => import('@/views/usermodel/UserCartView.vue'),
    meta: { requiresAuth: true }
  },
  {//查看购物车
    path: '/user/coupon',
    name: '我的优惠券',
    component: () => import('@/views/usermodel/UserCouponView.vue'),
    meta: { requiresAuth: true }
  },
  // 添加商品页
  {
    path: '/shopmodel/addProduct',
    name: 'addProduct',
    component: () => import('../views/shopmodel/AddProduct.vue')
  },
  // 忘记密码页
  {
    path: '/forget-password',
    name: 'forget-password',
    component: () => import('../views/ForgetPasswordView.vue')
  },
  // 管理员相关路由
  {
    path: '/admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true }, // 需要登录且为管理员
    children: [
      {
        path: '',
        redirect: 'dashboard' // 默认跳转至仪表盘
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/DashboardView.vue')
      },
      {
        path: 'shop-audit',
        name: 'ShopAudit',
        component: () => import('../views/admin/ShopAuditView.vue')
      },
      {
        path: 'product-audit',
        name: 'ProductAudit',
        component: () => import('../views/admin/ProductAuditView.vue')
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: UserManagement
      },
      {
        path: 'coupons',
        name: '优惠券管理',
        component: CouponManageView
      },
      {
        path: 'ads',
        name: 'AdManagement',
        component: () => import('../views/admin/AdManagement.vue')
      }
    ]
  }
]

// 创建 VueRouter 实例
const router = new VueRouter({
  routes
})

// 全局路由守卫，用于权限校验
router.beforeEach((to, from, next) => {
  const store = router.app.$store; // 获取 Vuex 状态

  // 检查需要登录的路由
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isAuthenticated) {
      // 如果未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存跳转前路径
      });
    } else if (to.matched.some(record => record.meta.requiresAdmin)) {
      // 如果需要管理员权限
      if (store.state.user.role !== 'admin') {
        next('/'); // 若非管理员，跳转到主页
      } else {
        next(); // 管理员继续
      }
    } else {
      next(); // 已登录用户继续
    }
  } else {
    next(); // 无需登录，直接继续
  }
});

export default router
