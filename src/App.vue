<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <img src="@/assets/logo.png" alt="Logo">
        </div>
        <div class="search-box">
          <input type="text" placeholder="搜索商品">
          <button>搜索</button>
        </div>
        <div class="header-right">
          <div class="cart">
            <i class="fas fa-shopping-cart"></i>
            <router-link to="/cart">购物车</router-link> 
          </div>
          <div class="user">
            <template v-if="isAuthenticated">
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  {{ currentUser.username }}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="userCenter">用户中心</el-dropdown-item>
                  <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
            <template v-else>
              <router-link to="/login">登录</router-link> | 
              <router-link to="/register">注册</router-link>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- 主导航菜单 -->
    <nav class="main-nav">
      <div class="nav-content">
        <div class="categories">
          <span>全部商品分类</span>
        </div>
        <div class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/new">新品上市</router-link>
          <router-link to="/hot">热销商品</router-link>
          <router-link to="/promotion">优惠活动</router-link>
          <router-link to="/shopmodel/asshop">成为商家</router-link>
        </div>
      </div>
    </nav>

    <!-- 路由视图 -->
    <router-view/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser'])
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
          this.$router.push('/login');
          break;
      }
    }
  }
}
</script>


<style lang="scss">
// 重置默认样式
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

// 头部样式
.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    img {
      height: 40px;
    }
  }

  .search-box {
    display: flex;
    
    input {
      width: 400px;
      padding: 8px 15px;
      border: 2px solid #ff6700;
      border-right: none;
      outline: none;
    }

    button {
      padding: 8px 20px;
      background-color: #ff6700;
      color: white;
      border: none;
      cursor: pointer;
    }
  }

  .header-right {
    display: flex;
    gap: 20px;
    
    .cart, .user {
      cursor: pointer;
    }
  }
}

// 主导航样式
.main-nav {
  background-color: #ff6700;
  
  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    
    .categories {
      padding: 15px 30px;
      color: white;
      cursor: pointer;
      
      &:hover {
        background-color: #f85000;
      }
    }
    
    .nav-links {
      display: flex;
      gap: 30px;
      
      a {
        color: white;
        text-decoration: none;
        padding: 15px 0;
        
        &:hover {
          color: #ffd;
        }
      }
    }
  }
}

.el-dropdown-link {
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #ff6700;
  }
}

.el-dropdown-menu {
  .el-dropdown-item {
    color: #333;
    
    &:hover {
      color: #ff6700;
    }
  }
}
</style>
