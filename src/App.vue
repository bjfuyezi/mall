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
          <router-link to="/cart" class="action-item">
            <i class="el-icon-shopping-cart-2"></i>
            <span>购物车</span>
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
            <router-link to="/new" class="nav-item">新品</router-link>
            <router-link to="/hot" class="nav-item">热卖</router-link>
            <router-link to="/promotion" class="nav-item">优惠</router-link>
            <router-link to="/shopmodel/asshop" class="nav-item">成为商家</router-link>
            <router-link to="/shopmodel/shopManage" class="nav-item">店铺管理</router-link>
            <router-link to="/shopmodel/info" class="nav-item">管理店铺信息</router-link>
            <router-link to="/shopmodel/productManage" class="nav-item">管理商品</router-link>
          </div>
        </div>
      </div>
    </el-header>
    <router-view/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  data() {
    return {
      searchKeyword: ''
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser'])
  },
  methods: {
    handleSearch() {
      console.log('搜索:', this.searchKeyword)
    },
    handleCommand(command) {
      switch(command) {
        case 'userCenter':
          this.$router.push('/user/center');
          break;
        case 'orders':
          this.$router.push('/user/orders');
          break;
        case 'logout':
          this.$store.dispatch('logout');
          this.$message.success('已退出登录');
          this.$router.push('/login');
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
}
</style>