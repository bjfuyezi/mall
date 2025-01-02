<template>
  <div class="user-profile">
    <div class="profile-container">
      <h2>个人资料</h2>
      <el-form :model="profileForm" :rules="rules" ref="profileForm" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" disabled></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email"></el-input>
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="profileForm.newPassword"></el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="profileForm.confirmPassword"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存修改</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserProfile',
  data() {
    const validatePass2 = (rule, value, callback) => {
      if (value !== this.profileForm.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      profileForm: {
        username: '',
        email: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['currentUser'])
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      this.$axios.get(`http://localhost:8081/users/detail/${this.currentUser.username}`)
        .then(response => {
          if (response.data.status === 'success') {
            const { username, email } = response.data.data;
            this.profileForm.username = username;
            this.profileForm.email = email;
          }
        });
    },
    submitForm() {
      this.$refs.profileForm.validate(valid => {
        if (valid) {
          const updateData = {
            username: this.profileForm.username,
            email: this.profileForm.email
          };
          if (this.profileForm.newPassword) {
            updateData.password = this.profileForm.newPassword;
          }
          
          this.$axios.put('http://localhost:8081/users/update', updateData)
            .then(response => {
              if (response.data.status === 'success') {
                this.$message.success('个人信息更新成功');
                this.$store.dispatch('login', { username: this.profileForm.username });
              }
            })
            .catch(error => {
              this.$message.error('更新失败：' + error.message);
            });
        }
      });
    },
    resetForm() {
      this.$refs.profileForm.resetFields();
      this.getUserInfo();
    }
  }
}
</script> 