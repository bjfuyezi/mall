<template>
  <div class="user-center">
    <div class="user-container">
      <h2>用户中心</h2>
      <div class="user-content" v-if="userInfo">
        <div class="user-info">
          <h3>个人信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ userInfo.role }}</el-descriptions-item>
            <el-descriptions-item label="账号状态">{{ userInfo.status }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ userInfo.created_time }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="user-actions">
          <el-menu class="user-menu" :default-active="activeMenu">
            <el-menu-item index="1">
              <router-link to="/user/orders">我的订单</router-link>
            </el-menu-item>
            <el-menu-item index="2">
              <router-link to="/user/profile">个人资料</router-link>
            </el-menu-item>
            <el-menu-item index="3">
              <router-link to="/user/address">收货地址</router-link>
            </el-menu-item>
          </el-menu>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserCenter',
  data() {
    return {
      userInfo: null,
      activeMenu: '1'
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'isAuthenticated'])
  },
  created() {
    if (!this.isAuthenticated) {
      this.$router.push({
        path: '/login',
        query: { redirect: '/user/center' }
      });
    } else {
      this.getUserInfo();
    }
  },
  methods: {
    getUserInfo() {
      this.$axios.get(`http://localhost:8081/users/detail/${this.currentUser.username}`)
        .then(response => {
          if (response.data.status === 'success') {
            this.userInfo = response.data.data;
          }
        })
        .catch(error => {
          console.error('获取用户信息失败:', error);
          this.$message.error('获取用户信息失败');
        });
    }
  }
}
</script>

<style lang="scss" scoped>
.user-center {
  min-height: calc(100vh - 120px);
  background-color: #f5f5f5;
  padding: 20px 0;

  .user-container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    h2 {
      margin-bottom: 20px;
      color: #333;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
  }

  .user-content {
    display: flex;
    gap: 20px;

    .user-info {
      flex: 1;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 4px;

      h3 {
        margin-bottom: 15px;
        color: #666;
      }
    }

    .user-actions {
      width: 200px;

      .user-menu {
        border-radius: 4px;
        
        a {
          text-decoration: none;
          color: #333;
          display: block;
          width: 100%;
          
          &:hover {
            color: #ff6700;
          }
        }
      }
    }
  }
}
</style> 