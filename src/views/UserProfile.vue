<template>
  <div class="user-profile">
    <el-card class="profile-card" shadow="never">
      <div slot="header" class="card-header">
        <div class="header-left">
          <el-button icon="el-icon-arrow-left" type="text" @click="goBack">返回</el-button>
          <span class="title">修改个人资料</span>
        </div>
        <el-button type="text" @click="startEdit" v-if="!isEditing">
          <i class="el-icon-edit"></i> 编辑
        </el-button>
      </div>
      
      <el-form 
        :model="userForm" 
        :disabled="!isEditing" 
        label-width="100px"
        class="profile-form">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="密码" v-if="isEditing">
          <el-input 
            v-model="userForm.password" 
            type="password" 
            placeholder="留空表示不修改"
            show-password>
          </el-input>
        </el-form-item>
        <el-form-item v-if="isEditing">
          <el-button type="primary" @click="saveProfile">保存</el-button>
          <el-button @click="cancelEdit">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'UserProfile',
  data() {
    return {
      userForm: {
        username: '',
        email: '',
        password: ''
      },
      isEditing: false,
      originalForm: null
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user
    }),
    ...mapGetters(['userId'])
  },
  methods: {
    async loadUserProfile() {
      try {
        const response = await fetch(`http://localhost:8081/users/${this.userId}`);
        const data = await response.json();
        if (data.status === 'success') {
          this.userForm = { ...data.data, password: '' };
          this.originalForm = { ...data.data };
        }
      } catch (error) {
        this.$message.error('获取用户信息失败');
      }
    },
    startEdit() {
      this.isEditing = true;
      this.originalForm = { ...this.userForm };
    },
    cancelEdit() {
      this.isEditing = false;
      this.userForm = { ...this.originalForm, password: '' };
    },
    async saveProfile() {
      try {
        const response = await fetch('http://localhost:8081/users/profile/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.userForm)
        });
        const data = await response.json();
        if (data.status === 'success') {
          this.$message.success('保存成功');
          this.isEditing = false;
          await this.loadUserProfile();
          this.$store.dispatch('updateUserProfile', this.userForm);
        } else {
          this.$message.error(data.message || '保存失败');
        }
      } catch (error) {
        this.$message.error('保存失败');
      }
    },
    goBack() {
      this.$router.push('/user/center');
    }
  },
  created() {
    this.loadUserProfile();
  }
}
</script>

<style lang="scss" scoped>
.user-profile {
  .profile-card {
    border: none;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 2px solid #ff6700;

      .header-left {
        display: flex;
        align-items: center;
        gap: 10px;

        .title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
      }
    }

    .profile-form {
      max-width: 500px;
      margin: 30px auto;

      .el-form-item {
        margin-bottom: 25px;
      }

      ::v-deep .el-form-item__label {
        font-weight: 500;
      }

      ::v-deep .el-input__inner {
        &:disabled {
          background-color: #f5f5f5;
        }
      }

      .el-button {
        padding: 12px 25px;
      }
    }
  }
}
</style> 