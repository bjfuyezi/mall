<template>
  <div class="user-center">
    <el-container>
      <el-main>
        <div class="center-content">
          <!-- 用户信息和导航菜单 -->
          <div class="user-info-section">
            <div class="user-info-card">
              <div class="avatar">
                <i class="el-icon-user-solid"></i>
              </div>
              <div class="welcome">欢迎，{{ currentUser.username }}</div>
              <div class="user-email">{{ currentUser.email }}</div>
              <div class="default-address" v-if="defaultAddress">
                <div class="title">默认收货地址：</div>
                <div class="content">
                  {{ defaultAddress.province }} {{ defaultAddress.addressContent }}
                </div>
              </div>
            </div>
            
            <!-- 导航菜单 -->
            <el-menu
              :default-active="activeMenu"
              @select="handleSelect"
              class="user-menu">
              <el-menu-item index="profile">
                <i class="el-icon-edit"></i>
                <span>修改个人资料</span>
              </el-menu-item>
              <el-menu-item index="address">
                <i class="el-icon-location"></i>
                <span>收货地址</span>
              </el-menu-item>
            </el-menu>
          </div>
        </div>
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
      activeMenu: 'profile',
      defaultAddress: null
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'userId'])
  },
  methods: {
    handleSelect(key) {
      if (key === 'profile') {
        this.$router.push('/user/profile')
      } else if (key === 'address') {
        this.$router.push('/user/address')
      }
    },
    async loadDefaultAddress() {
      try {
        const response = await fetch(`http://localhost:8081/addresses/user/${this.userId}`);
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          this.defaultAddress = data.data.find(addr => addr.isDefault === 1);
        }
      } catch (error) {
        console.error('Error loading default address:', error);
      }
    }
  },
  created() {
    const path = this.$route.path;
    this.activeMenu = path.includes('address') ? 'address' : 'profile';
    this.loadDefaultAddress();
  },
  watch: {
    $route(to) {
      this.activeMenu = to.path.includes('address') ? 'address' : 'profile';
    }
  }
}
</script>

<style lang="scss" scoped>
.user-center {
  min-height: calc(100vh - 150px);
  background-color: #f5f5f5;
  
  .el-container {
    background-color: transparent;
    min-height: 100%;
  }

  .el-main {
    padding: 20px 0;
    height: auto;
    overflow: visible; // 防止出现滚动条
  }

  .center-content {
    max-width: 300px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    height: auto;
    overflow: visible; // 防止出现滚动条
  }

  .user-info-section {
    width: 100%;
    height: auto;
  }

  .user-info-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

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
      font-size: 18px;
      color: #333;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .user-email {
      font-size: 14px;
      color: #666;
      margin-bottom: 15px;
    }

    .default-address {
      text-align: left;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #e6e6e6;

      .title {
        font-size: 14px;
        color: #666;
        margin-bottom: 5px;
      }

      .content {
        font-size: 13px;
        color: #333;
        line-height: 1.4;
      }
    }
  }

  .user-menu {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

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

// 全局样式，消除 element-ui 的默认滚动条
::v-deep .el-main {
  overflow: visible !important;
}

// 如果需要，也可以添加以下样式来美化必要的滚动条
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: #f5f5f5;
}
</style> 