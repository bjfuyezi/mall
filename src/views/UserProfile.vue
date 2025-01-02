<template>
  <div class="user-profile">
    <el-card class="profile-card">
      <div slot="header" class="card-header">
        <span>个人资料</span>
        <el-button type="text" @click="startEdit" v-if="!isEditing">编辑</el-button>
      </div>
      
      <el-form :model="userForm" :disabled="!isEditing" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="密码" v-if="isEditing">
          <el-input v-model="userForm.password" type="password" placeholder="留空表示不修改"></el-input>
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
    }
  },
  created() {
    this.loadUserProfile();
  }
}
</script>

<style scoped>
.user-profile {
  padding: 20px;
}

.profile-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 