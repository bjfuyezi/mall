<template>
  <div id="app">
    <el-header>
      <div class="header-container">
        <!-- 左侧 Logo -->
        <router-link to="/" class="logo">
          商城
        </router-link>

        <!-- 中间搜索框 -->
        <div class="search-box">
          <el-input
            placeholder="请输入商品名称"
            v-model="searchKeyword"
            class="search-input"
          >
            <el-button slot="append" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          </el-input>
        </div>

        <!-- 右侧用户操作区 -->
        <div class="user-actions">
          <router-link to="/user/orders" class="action-item">
            <i class="el-icon-s-order"></i>
            <span>我的订单</span>
          </router-link>
          <router-link to="/user/cart" class="action-item">
            <i class="el-icon-shopping-cart-2"></i>
            <span>我的购物车</span>
          </router-link>
          <template v-if="!isAuthenticated">
            <router-link to="/login" class="action-item">登录</router-link>
            <router-link to="/register" class="action-item">注册</router-link>
          </template>
          <el-dropdown v-else @command="handleCommand" class="action-item">
            <span class="el-dropdown-link">
              {{ currentUser.username }}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="userCenter">用户中心</el-dropdown-item>
              <el-dropdown-item command="orders">我的订单</el-dropdown-item>
              <el-dropdown-item command="myCoupon">我的优惠券</el-dropdown-item>
              <el-dropdown-item command="comment">我的评价</el-dropdown-item>
              <el-dropdown-item command="product">商品收藏</el-dropdown-item>
              <el-dropdown-item command="shop">店铺收藏与拉黑</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>

      <!-- 下方导航菜单 -->
      <div class="nav-menu">
        <div class="nav-container">
          <div class="nav-left">
            <router-link to="/" class="nav-item">首页</router-link>
            <router-link to="/promotion" class="nav-item">优惠</router-link>
            <template v-if="isAuthenticated && currentUser.role === 'buyer'">
              <router-link to="/shopmodel/asshop" class="nav-item">成为商家</router-link>
            </template>
            <!--   下面三个部分应该是需要判断是否是商家才可以有的吧     -->
            <template v-if="isAuthenticated && currentUser.role === 'seller'">
              <router-link to="/shopmodel/info" class="nav-item">店铺信息管理</router-link>
              <router-link to="/shopmodel/productManage" class="nav-item">商品管理</router-link>
              <router-link to="/shopmodel/promotionManage" class="nav-item">推广管理</router-link>
              <router-link to="/shopmodel/couponManage" class="nav-item">优惠管理</router-link>
            </template>
            <!-- 管理员页面按钮 -->
            <template v-if="isAuthenticated && currentUser.role === 'admin'">
              <router-link to="/admin" class="nav-item">管理员页面</router-link>
            </template>
          </div>
        </div>
      </div>
    </el-header>
    <router-view/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'  // 从 vuex 中导入 mapGetters，用于将 state 中的 getter 映射到组件的计算属性

export default {
  name: 'App',  // 组件名称为 App
  data() {
    return {
      searchKeyword: ''  // 初始化搜索关键词为空字符串
    }
  },
  computed: {
    // 使用 mapGetters 将 vuex store 中的 getter 映射到当前组件的计算属性
    // 'isAuthenticated' 和 'currentUser' 分别是 vuex store 中的 getter，用于获取用户认证状态和当前用户信息
    ...mapGetters(['isAuthenticated', 'currentUser'])
  },
  methods: {
    // 处理搜索逻辑的方法
    handleSearch() {
      console.log('搜索:', this.searchKeyword)  // 在控制台输出搜索关键词
      this.$router.push({
        name: 'searchView',
        params: { key: this.searchKeyword }
      });
    },
    // 处理命令的选择方法，根据传入的 command 执行不同的操作
    handleCommand(command) {
      switch(command) {
        case 'userCenter':  // 如果命令是 'userCenter'
          this.$router.push('/user/center');  // 跳转到用户中心页面
          break;
        case 'orders':  // 如果命令是 'orders'
          this.$router.push('/user/orders');  // 跳转到用户订单页面
          break;
        case 'myCoupon':
          this.$router.push('/user/coupon');
          break;
        case 'comment':  // 如果命令是 'comment'
          this.$router.push('/user/comments');  // 跳转到用户评论页面
          break;
        case 'logout':  // 如果命令是 'logout'
          /* 这里退出应该需要清除 store 里的数据，不知道有没有清理掉 */
          this.$store.dispatch('logout');  // 调用 vuex 的 logout 动作，清除用户的认证信息或相关数据
          this.$message.success('已退出登录');  // 弹出提示消息，提示用户已退出登录
          this.$router.push('/login');  // 跳转到登录页面
          break;
        case 'product':
          this.$router.push('/star/productStar');
          break;
        case 'shop':
        this.$router.push('/star/shopStar');
          break;
      }
    }
  }
}
</script>


<style lang="scss">
#app {
  font-family: Arial, sans-serif;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #ff6700;
  text-decoration: none;
  min-width: 200px;
}

.search-box {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;

  .search-input {
    .el-input-group__append {
      background-color: #ff6700;
      border-color: #ff6700;
      color: white;
      
      &:hover {
        background-color: #f85000;
        border-color: #f85000;
      }
    }
  }
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;

  .action-item {
    color: #333;
    text-decoration: none;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 5px;
    
    i {
      font-size: 18px;
    }

    &:hover {
      color: #ff6700;
    }
  }
}

.nav-menu {
  background-color: #f5f5f5;
  border-top: 1px solid #e8e8e8;
  margin-top: 10px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 20px;

  .nav-left {
    display: flex;
    gap: 30px;

    .nav-item {
      color: #333;
      text-decoration: none;
      font-size: 14px;
      line-height: 40px;
      
      &:hover, &.router-link-active {
        color: #ff6700;
      }
    }
  }
}

.el-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0;
  height: auto !important;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  
  .el-icon--right {
    margin-left: 5px;
  }
}

#app {
  padding-top: 110px;
  min-height: 90vh; /* 确保 App 组件的最小高度为视口高度 */
  display: flex;
  flex-direction: column;
}
</style>