<template>
  <div class="forget-password-page">
    <div class="forget-password-container">
      <h2>重置密码</h2>
      <el-steps :active="currentStep" finish-status="success" simple style="margin: 20px 0">
        <el-step title="验证身份"></el-step>
        <el-step title="重置密码"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 步骤1：验证身份 -->
      <div v-if="currentStep === 0" class="step-content">
        <el-form :model="formData" :rules="rules" ref="verifyForm">
          <el-form-item prop="username" label="用户名">
            <el-input 
              v-model="formData.username" 
              placeholder="请输入用户名"
              @blur="checkUsername"
            ></el-input>
          </el-form-item>
          <el-form-item prop="email" label="邮箱">
            <el-input 
              v-model="formData.email" 
              placeholder="请输入邮箱"
              @blur="checkUserEmail"
            ></el-input>
          </el-form-item>
          <el-form-item prop="verificationCode" label="验证码">
            <div class="verification-code">
              <el-input 
                v-model="formData.verificationCode" 
                placeholder="请输入验证码"
                :maxlength="6"
                class="code-input"
              >
              </el-input>
              <el-button 
                type="primary" 
                :disabled="!canSendCode"
                @click="sendVerificationCode"
                size="small"
                class="send-code-btn"
              >
                {{ codeButtonText }}
              </el-button>
            </div>
          </el-form-item>
          <el-button type="primary" @click="verifyIdentity" :loading="loading">下一步</el-button>
        </el-form>
      </div>

      <!-- 步骤2：重置密码 -->
      <div v-if="currentStep === 1" class="step-content">
        <el-form :model="formData" :rules="rules" ref="passwordForm">
          <el-form-item prop="newPassword" label="新密码">
            <el-input 
              type="password" 
              v-model="formData.newPassword" 
              placeholder="请输入新密码"
            ></el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword" label="确认密码">
            <el-input 
              type="password" 
              v-model="formData.confirmPassword" 
              placeholder="请再次输入新密码"
            ></el-input>
          </el-form-item>
          <el-button type="primary" @click="resetPassword" :loading="loading">确认重置</el-button>
        </el-form>
      </div>

      <!-- 步骤3：完成 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="success-message">
          <i class="el-icon-success"></i>
          <h3>密码重置成功</h3>
          <p>请使用新密码登录</p>
          <el-button type="primary" @click="goToLogin">返回登录</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ForgetPasswordView',
  data() {
    const validatePassword = (rule, value, callback) => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      if (!passwordRegex.test(value)) {
        callback(new Error('密码必须包含大小写字母和数字，且长度至少为8位'));
      } else {
        callback();
      }
    };

    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.formData.newPassword) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };

    return {
      currentStep: 0,
      loading: false,
      isCodeSent: false,
      countdown: 60,
      timer: null,
      emailFound: false,
      formData: {
        username: '',
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        verificationCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码必须是6位', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    canSendCode() {
      return this.formData.username && 
             this.formData.email && 
             this.emailFound && 
             !this.isCodeSent;
    },
    codeButtonText() {
      return this.isCodeSent ? `${this.countdown}秒后重试` : '发送验证码';
    }
  },
  methods: {
    async checkUsername() {
      if (!this.formData.username || !this.formData.email) return;
      
      try {
        const response = await axios.post(`http://localhost:8081/users/checkUserEmail`, {
          username: this.formData.username,
          email: this.formData.email
        });
        
        if (response.data.status === 'success') {
          this.emailFound = true;
          return true;
        } else {
          this.emailFound = false;
          this.$message.error('用户名和邮箱不匹配');
        }
        return false;
      } catch (error) {
        this.emailFound = false;
        this.$message.error('验证失败');
        return false;
      }
    },
    async checkUserEmail() {
      if (!this.formData.username || !this.formData.email) {
        this.emailFound = false;
        return;
      }
      
      try {
        const response = await axios.post(`http://localhost:8081/users/checkUserEmail`, {
          username: this.formData.username,
          email: this.formData.email
        });
        
        if (response.data.status === 'success') {
          this.emailFound = true;
          this.$message.success('邮箱验证成功');
        } else {
          this.emailFound = false;
          this.$message.warning('请输入正确的邮箱');
        }
      } catch (error) {
        this.emailFound = false;
        console.error('验证失败:', error);
        this.$message.error('验证失败，请稍后重试');
      }
    },
    async sendVerificationCode() {
      if (!this.emailFound) {
        this.$message.warning('请先验证邮箱');
        return;
      }

      try {
        const response = await axios.post('http://localhost:8081/users/sendResetCode', {
          username: this.formData.username,
          email: this.formData.email
        });
        
        if (response.data.status === 'success') {
          this.$message.success('验证码已发送');
          this.startCountdown();
        } else {
          this.$message.error(response.data.message || '发送验证码失败');
        }
      } catch (error) {
        console.error('发送验证码失败:', error);
        this.$message.error('发送验证码失败');
      }
    },
    startCountdown() {
      this.isCodeSent = true;
      this.countdown = 60;
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.isCodeSent = false;
          clearInterval(this.timer);
        }
      }, 1000);
    },
    async verifyIdentity() {
      try {
        await this.$refs.verifyForm.validate();
        
        const response = await axios.post('http://localhost:8081/users/verifyResetCode', {
          username: this.formData.username,
          code: this.formData.verificationCode
        });
        
        if (response.data.status === 'success') {
          this.currentStep = 1;
        } else {
          this.$message.error('验证码错误');
        }
      } catch (error) {
        console.error('验证失败:', error);
        this.$message.error('验证失败');
      }
    },
    async resetPassword() {
      try {
        await this.$refs.passwordForm.validate();
        
        this.loading = true;
        console.log('Resetting password for:', {
          username: this.formData.username,
          newPassword: this.formData.newPassword
        });

        const response = await axios.post('http://localhost:8081/users/resetPassword', {
          username: this.formData.username,
          newPassword: this.formData.newPassword
        });
        
        console.log('Reset password response:', response.data);
        
        if (response.data.status === 'success') {
          this.$message.success('密码重置成功');
          this.currentStep = 2;
        } else {
          this.$message.error(response.data.message || '重置密码失败');
        }
      } catch (error) {
        console.error('Reset password error:', error);
        this.$message.error(error.response?.data?.message || '重置密码失败');
      } finally {
        this.loading = false;
      }
    },
    goToLogin() {
      this.$router.push('/login');
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  watch: {
    'formData.username'() {
      this.emailFound = false;
    },
    'formData.email'() {
      this.emailFound = false;
    }
  }
}
</script>

<style lang="scss" scoped>
.forget-password-page {
  min-height: calc(100vh - 120px);
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.forget-password-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;

  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }
}

.step-content {
  margin-top: 30px;
}

.verification-code {
  display: flex;
  gap: 10px;
  align-items: center;

  .code-input {
    width: 200px;
  }

  .send-code-btn {
    width: 95px;
    padding: 9px 10px;
    font-size: 12px;
    
    &:not(:disabled) {
      cursor: pointer;
      &:hover {
        opacity: 0.9;
      }
    }
  }
}

.success-message {
  text-align: center;
  padding: 30px 0;

  i {
    font-size: 60px;
    color: #67C23A;
    margin-bottom: 20px;
  }

  h3 {
    margin: 20px 0 10px;
    color: #333;
  }

  p {
    color: #666;
    margin-bottom: 20px;
  }
}

.el-form {
  .el-button {
    width: 100%;
    margin-top: 20px;
  }
}
</style> 