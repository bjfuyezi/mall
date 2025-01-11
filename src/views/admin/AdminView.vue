<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          @select="handleSelect"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="dashboard">
            <i class="el-icon-s-home"></i>
            <span>控制台</span>
          </el-menu-item>
          <el-menu-item index="coupons">
            <i class="el-icon-s-ticket"></i>
            <span>优惠券管理</span>
          </el-menu-item>
          <el-menu-item index="ads">
            <i class="el-icon-s-promotion"></i>
            <span>广告管理</span>
          </el-menu-item>
          <el-menu-item index="users">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </el-menu-item>
          
          <el-submenu index="shop">
            <template slot="title">
              <i class="el-icon-s-shop"></i>
              <span>商家管理</span>
            </template>
            <el-menu-item index="shop-audit">商家审核</el-menu-item>
          </el-submenu>

          <el-submenu index="product">
            <template slot="title">
              <i class="el-icon-goods"></i>
              <span>商品管理</span>
            </template>
            <el-menu-item index="product-audit">商品审核</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header>
          <div class="header-content">
            <h2>{{ pageTitle }}</h2>
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                管理员 <i class="el-icon-arrow-down"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'AdminView',
  data() {
    return {
      activeMenu: 'dashboard',
      pageTitle: '控制台'
    }
  },
  methods: {
    handleSelect(key) {
      this.activeMenu = key;
      switch(key) {
        case 'dashboard':
          this.pageTitle = '控制台';
          this.$router.push('/admin/dashboard');
          break;
        case 'shop-audit':
          this.pageTitle = '商家审核';
          this.$router.push('/admin/shop-audit');
          break;
        case 'product-audit':
          this.pageTitle = '商品审核';
          this.$router.push('/admin/product-audit');
          break;
        case 'coupons':
          this.pageTitle = '优惠券管理';
          this.$router.push('/admin/coupons');
          break;
        case 'ads':
          this.pageTitle = '广告管理';
          this.$router.push('/admin/ads');
          break;
        case 'users':
          this.pageTitle = '用户管理';
          this.$router.push('/admin/users');
          break;
      }
    },
    handleCommand(command) {
      if (command === 'logout') {
        this.$store.commit('clearUser');
        this.$router.push('/login');
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
}

.el-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  
  .admin-menu {
    border-right: none;
  }
}

.el-header {
  background-color: white;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  
  .header-content {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h2 {
      margin: 0;
      font-size: 20px;
    }
    
    .el-dropdown-link {
      cursor: pointer;
      color: #409EFF;
    }
  }
}

.el-main {
  background-color: #f0f2f5;
  padding: 10px;
}
h2 {
  padding: 0px;
  margin: 0px;
}
</style> 