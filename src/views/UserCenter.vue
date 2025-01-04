<template>
  <div class="user-center">
    <el-container>
      <el-aside width="250px">
        <div class="user-info-card">
          <div class="avatar">
            <i class="el-icon-user-solid"></i>
          </div>
          <div class="welcome">欢迎，{{ currentUser.username }}</div>
        </div>
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
import { mapGetters } from 'vuex'

export default {
  name: 'UserCenter',
  data() {
    return {
      activeMenu: 'profile'
    }
  },
  computed: {
    ...mapGetters(['currentUser'])
  },
  created() {
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

<style lang="scss" scoped>
.user-center {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 150px);

  .el-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    min-height: calc(100vh - 190px);
  }

  .el-aside {
    background-color: #fff;
    border-right: 1px solid #e6e6e6;
    padding: 0;

    .user-info-card {
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #e6e6e6;
      background-color: #fafafa;

      .avatar {
        width: 80px;
        height: 80px;
        line-height: 80px;
        border-radius: 50%;
        background-color: #ff6700;
        color: white;
        margin: 0 auto 15px;
        
        i {
          font-size: 40px;
        }
      }

      .welcome {
        font-size: 16px;
        color: #333;
        margin-bottom: 10px;
      }
    }

    .user-menu {
      border-right: none;

      .el-menu-item {
        font-size: 15px;
        height: 50px;
        line-height: 50px;

        &:hover, &.is-active {
          color: #ff6700;
          background-color: #fff5f0;

          i {
            color: #ff6700;
          }
        }

        i {
          margin-right: 10px;
        }
      }
    }
  }

  .el-main {
    padding: 20px;
    background-color: #fff;
  }
}
</style> 