<template>
  <div class="user-center">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          @select="handleSelect"
          class="user-menu">
          <el-menu-item index="profile">
            <i class="el-icon-user"></i>
            <span>个人资料</span>
          </el-menu-item>
          <el-menu-item index="address">
            <i class="el-icon-location"></i>
            <span>收货地址</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'UserCenter',
  data() {
    return {
      activeMenu: 'profile'
    }
  },
  created() {
    // 根据当前路由设置激活的菜单项
    const path = this.$route.path
    if (path.includes('address')) {
      this.activeMenu = 'address'
    } else {
      this.activeMenu = 'profile'
    }
  },
  methods: {
    handleSelect(key) {
      if (key === 'profile') {
        this.$router.push('/user/profile')
      } else if (key === 'address') {
        this.$router.push('/user/address')
      }
    }
  }
}
</script>

<style scoped>
.user-center {
  padding: 20px;
}

.user-menu {
  border-right: solid 1px #e6e6e6;
  height: 100%;
}

.el-aside {
  background-color: #fff;
  margin-right: 20px;
}
</style> 