<template>
  <div id="app">
    <!-- 只在非管理员页面显示导航栏 -->
    <template v-if="!isAdminRoute">
      <el-header>
        <div class="header-container">
          <!-- Logo -->
          <router-link to="/" class="logo">
            商城
          </router-link>

          <!-- 搜索框 -->
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索商品"
              class="search-input"
            >
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </div>

          <!-- 用户操作区 -->
          <div class="user-actions">
            <template v-if="isAuthenticated">
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  {{ username }}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="userCenter">个人中心</el-dropdown-item>
                  <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
            <template v-else>
              <router-link to="/login" class="action-item">
                <i class="el-icon-user"></i>
                登录
              </router-link>
            </template>
            <router-link to="/cart" class="action-item">
              <i class="el-icon-shopping-cart-2"></i>
              购物车
            </router-link>
          </div>
        </div>

        <!-- 导航菜单 -->
        <nav class="nav-menu">
          <div class="nav-container">
            <div class="nav-left">
              <router-link to="/" class="nav-item">首页</router-link>
              <router-link to="/new" class="nav-item">新品</router-link>
              <router-link to="/hot" class="nav-item">热卖</router-link>
              <router-link to="/promotion" class="nav-item">优惠</router-link>
            </div>
          </div>
        </nav>
      </el-header>
    </template>

    <!-- 路由视图 -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      searchQuery: ''
    }
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
    },
    username() {
      return this.$store.state.user?.username || ''
    },
    isAdminRoute() {
      return this.$route.path.startsWith('/admin')
    }
  },
  methods: {
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

